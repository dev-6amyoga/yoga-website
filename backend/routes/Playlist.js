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
const { spawn } = require('child_process')

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
    const filteredPlaylists = playlists.filter(
      (playlist) => playlist.playlist_mode !== 'deleted'
    )
    res.json(filteredPlaylists)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Failed to fetch playlists',
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

    // Set the last_updated field to the current time
    const mergedData = {
      ...existingPlaylist.toObject(),
      ...updatedData,
      last_updated: new Date(), // Add the current date and time
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

      console.log(files)

      // combine them
      let mpdCombiner = new MPDCombiner(files, null)
      // save the combined mpd file
      let [combinedManifest, totalDuration, sections] =
        await mpdCombiner.getCombinedManifest()

      console.log(combinedManifest, totalDuration, sections)
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

router.post('/playlists/calculateDuration', async (req, res) => {
  try {
    const { items } = req.body // Input example: [1, 2, "T_9", 4, "T-8", "T_9"]

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid input format' })
    }
    const asanaIds = items.filter((id) => typeof id === 'number')
    const transitionIds = items.filter((id) => typeof id === 'string')
    let files = []
    if (asanaIds.length > 0) {
      const asanas = await Asana.find(
        { id: { $in: asanaIds } },
        'id asana_name asana_dash_url'
      )
      asanas.forEach((asana) => {
        if (asana.asana_dash_url) {
          const split = asana.asana_dash_url.split('/')
          const name =
            split.length > 2 ? split[split.length - 2] : `asana_${asana.id}`
          files.push({
            original: asana.asana_name || `Unknown Asana ${asana.id}`,
            name: name || `asana_${asana.id}`, // Ensure name is set
            url: asana.asana_dash_url,
          })
        }
      })
    }
    if (transitionIds.length > 0) {
      const transitions = await TransitionVideo.find(
        { transition_id: { $in: transitionIds } },
        'transition_id transition_video_name transition_dash_url'
      )
      transitions.forEach((transition) => {
        if (transition.transition_dash_url) {
          const split = transition.transition_dash_url.split('/')
          const name =
            split.length > 2
              ? split[split.length - 2]
              : `transition_${transition.transition_id}`
          files.push({
            original:
              transition.transition_video_name ||
              `Unknown Transition ${transition.transition_id}`,
            name: name || `transition_${transition.transition_id}`, // Ensure name is set
            url: transition.transition_dash_url,
          })
        }
      })
    }
    if (files.length === 0) {
      return res
        .status(404)
        .json({ message: 'No valid asanas or transitions found' })
    }
    console.log('Files being sent to MPDCombiner:', files)
    let mpdCombiner = new MPDCombiner(files, null)
    let [_, totalDuration] = await mpdCombiner.getCombinedManifest()
    return res.status(200).json({ totalDuration })
  } catch (error) {
    console.error('Error in calculateDuration:', error)
    return res.status(500).json({ error: 'Failed to calculate duration' })
  }
})

module.exports = router
