const express = require('express')
const router = express.Router()
const Playlist = require('../models/mongo/Playlist')
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
const R2 = require('../utils/R2Client')
const { ListObjectsCommand } = require('@aws-sdk/client-s3')
const Asana = require('../models/mongo/Asana')
const TransitionVideo = require('../models/mongo/TransitionVideo')
const { MPDCombiner } = require('../utils/ManifestCombiner')

router.post('/playlists/addPlaylist', async (req, res) => {
  try {
    const requestData = req.body
    const maxIdPlaylist = await Playlist.findOne(
      {},
      {},
      { sort: { playlist_id: -1 } }
    )
    const newPlaylistId = maxIdPlaylist ? maxIdPlaylist.playlist_id + 1 : 1
    requestData.playlist_id = newPlaylistId
    const newPlaylist = new Playlist(requestData)
    const savedPlaylist = await newPlaylist.save()
    res.status(200).json(savedPlaylist)
  } catch (error) {
    console.error('Error saving new Playlist:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save new Playlist',
    })
  }
})

router.get('/playlists/getAllPlaylists', async (req, res) => {
  try {
    const playlists = await Playlist.find()
    res.json(playlists)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch videos',
    })
  }
})

router.put('/playlists/updatePlaylist/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId
  const updatedData = req.body
  console.log(playlistId, updatedData)
  try {
    const existingPlaylist = await Playlist.findOne({
      playlist_id: playlistId,
    })
    if (!existingPlaylist) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'Playlist not found' })
    }
    const mergedData = {
      ...existingPlaylist.toObject(),
      ...updatedData,
    }
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { playlist_id: playlistId },
      mergedData,
      {
        new: true,
      }
    )
    res.json(updatedPlaylist)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update Playlist',
    })
  }
})

router.get('/playlists/getPlaylistById/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId
  console.log(playlistId)
  try {
    const existingPlaylist = await Playlist.findOne({
      playlist_id: playlistId,
    })
    if (!existingPlaylist) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'Playlist not found' })
    }
    res.status(HTTP_OK).json(existingPlaylist)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update Playlist',
    })
  }
})

router.delete('/playlists/deletePlaylist/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId
  try {
    const deletedPlaylist = await Playlist.findOneAndDelete({
      playlist_id: playlistId,
    })
    if (deletedPlaylist) {
      res.status(HTTP_OK).json({
        message: 'Playlist deleted successfully',
      })
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: 'Playlist not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete Playlist',
    })
  }
})

router.post('/playlists/createManifest/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId
  try {
    const playlist = await Playlist.findOne({
      playlist_id: playlistId,
    })

    if (playlist) {
      // all the asanas and transitions

      const asanaIds = playlist.asana_ids.filter((id) => typeof id === 'number')

      // console.log(asanaIds);

      let asanas = []

      let asanaMap = {}

      if (asanaIds.length > 0) {
        asanas = await Asana.find({ id: { $in: asanaIds } })

        asanaMap = asanas.reduce((acc, a) => {
          acc[a.id] = a
          return acc
        }, {})
      }

      const transitionIds = playlist.asana_ids.filter(
        (id) => typeof id === 'string'
      )

      let transitions = []

      let transitionMap = {}

      if (transitionIds.length > 0) {
        transitions = await TransitionVideo.find({
          transition_id: { $in: transitionIds },
        })

        transitionMap = transitions.reduce((acc, t) => {
          acc[t.transition_id] = t
          return acc
        }, {})
      }

      // get all the mpd files

      /*
			{
				name: "",
				url: "",
			}
			*/

      const files = playlist.asana_ids.map((id) => {
        if (typeof id === 'number') {
          const asana = asanaMap[id]
          if (!asana) {
            throw new Error('Asana not found : ' + id)
          }

          const split = asana.asana_dash_url.split('/')
          const name = split[split.length - 2]

          return {
            original: asana.asana_name,
            name: name,
            url: asana.asana_dash_url,
          }
        } else {
          const transition = transitionMap[id]

          if (!transition) {
            throw new Error('Transition not found : ' + id)
          }
          const split = transition.transition_dash_url.split('/')
          const name = split[split.length - 2]
          return {
            original: transition.transition_video_name,
            name: name,
            url: transition.transition_dash_url,
          }
        }
      })

      // console.log(files);

      // combine them
      let mpdCombiner = new MPDCombiner(files, null)
      // save the combined mpd file
      let [combinedManifest, totalDuration, sections] =
        await mpdCombiner.getCombinedManifest()

      // console.log(combinedManifest, totalDuration, sections);
      // save the file to cloudflare
      await R2.cloudflareAddFile(
        `${playlist._id.toString()}.mpd`,
        combinedManifest
      )

      if (!process.env.CLOUDFLARE_R2_PUBLIC_URL) {
        throw new Error('CLOUDFLARE_R2_PUBLIC_URL not set')
      }

      playlist.playlist_dash_url = `${
        process.env.CLOUDFLARE_R2_PUBLIC_URL
      }/${playlist._id.toString()}.mpd`

      console.log(totalDuration)
      if (totalDuration) {
        playlist.duration = totalDuration
      }

      if (sections) {
        playlist.sections = sections
      }

      await playlist.save()

      return res.status(HTTP_OK).json({ message: 'Manifest generated' })
    } else {
      return res.status(HTTP_NOT_FOUND).json({ message: 'Playlist not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to generate manifest for playlist',
    })
  }
})

module.exports = router
