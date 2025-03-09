const express = require('express')
const router = express.Router()
const UserPlaylist = require('../models/mongo/UserPlaylist')
const Playlist = require('../models/mongo/Playlist')
const mongoose = require('mongoose')
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
const R2 = require('../utils/R2Client')
const Asana = require('../models/mongo/Asana')
const TransitionVideo = require('../models/mongo/TransitionVideo')
const { MPDCombiner } = require('../utils/ManifestCombiner')

router.post('/create', async (req, res) => {
  const {
    user_id,
    playlist_name,
    asana_ids,
    playlist_language,
    playlist_mode,
  } = req.body
  console.log(req.body)

  const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"

  try {
    let userPlaylists = await UserPlaylist.find({
      user_id,
      month: currentMonth,
    })

    if (userPlaylists && userPlaylists.length >= 2) {
      return res
        .status(201)
        .json({ message: 'You can only create 2 playlists per month.' })
    }

    // Separate asana IDs and transition IDs
    const asanaIds = asana_ids.filter((id) => typeof id === 'number')
    const transitionIds = asana_ids.filter((id) => typeof id === 'string')

    // Fetch asanas
    let asanas = []
    let asanaMap = {}

    if (asanaIds.length > 0) {
      asanas = await Asana.find({ id: { $in: asanaIds } })
      asanaMap = asanas.reduce((acc, a) => {
        acc[a.id] = a
        return acc
      }, {})
    }

    // Fetch transitions
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

    // Process files for MPD generation
    const files = asana_ids.map((id) => {
      if (typeof id === 'number') {
        const asana = asanaMap[id]
        if (!asana) throw new Error('Asana not found: ' + id)

        const split = asana.asana_dash_url.split('/')
        const name = split[split.length - 2]

        return { original: asana.asana_name, name, url: asana.asana_dash_url }
      } else {
        const transition = transitionMap[id]
        if (!transition) throw new Error('Transition not found: ' + id)

        const split = transition.transition_dash_url.split('/')
        const name = split[split.length - 2]

        return {
          original: transition.transition_video_name,
          name,
          url: transition.transition_dash_url,
        }
      }
    })

    console.log(files)

    // Generate combined MPD file
    let mpdCombiner = new MPDCombiner(files, null)
    let [combinedManifest, totalDuration, sections] =
      await mpdCombiner.getCombinedManifest()

    console.log(combinedManifest, totalDuration, sections)

    // Save the combined MPD file to Cloudflare
    await R2.cloudflareAddFile(`${Date.now()}.mpd`, combinedManifest)

    if (!process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      throw new Error('CLOUDFLARE_R2_PUBLIC_URL not set')
    }

    const playlist_dash_url = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${Date.now()}.mpd`

    // Create the playlist
    const newPlaylist = new Playlist({
      playlist_id: Date.now(),
      playlist_name,
      asana_ids,
      playlist_language,
      playlist_mode,
      drm_playlist: true,
      playlist_dash_url,
      duration: totalDuration || 0,
      sections: sections || [],
      playlist_start_date: new Date(),
      last_updated: new Date(),
    })

    await newPlaylist.save()

    // Update or create UserPlaylist entry
    const newUserPlaylist = new UserPlaylist({
      user_id,
      month: currentMonth,
      playlists: [newPlaylist._id],
      edits_left: 1,
    })

    await newUserPlaylist.save()

    res
      .status(200)
      .json({ message: 'Playlist created successfully', playlist: newPlaylist })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create playlist' })
  }
})

router.put('/edit/:playlistId', async (req, res) => {
  const { user_id, updates } = req.body // updates = { playlist_name, asana_ids, etc. }
  const { playlistId } = req.params
  const currentMonth = new Date().toISOString().slice(0, 7)
  try {
    const userPlaylists = await UserPlaylist.find({
      user_id,
      month: currentMonth,
    })
    const playlistObject = await Playlist.findOne({ playlist_id: playlistId })
    if (!playlistObject) {
      return res.status(404).json({ message: 'Playlist not found' })
    }
    const playlistObjectId = new mongoose.Types.ObjectId(playlistObject._id)
    let userPlaylistToBeEdited = null
    let playlistFound = false
    for (let userPlaylist of userPlaylists) {
      if (userPlaylist.playlists.some((id) => id.equals(playlistObjectId))) {
        userPlaylistToBeEdited = userPlaylist
        playlistFound = true
        break
      }
    }
    if (playlistFound) {
      if (!userPlaylistToBeEdited || userPlaylistToBeEdited.edits_left <= 0) {
        return res
          .status(400)
          .json({ message: 'No edits left for this month.' })
      }
      let oldPlaylistDashUrl = playlistObject.playlist_dash_url
      await Playlist.findOneAndDelete({ playlist_id: playlistId })
      const newPlaylist = new Playlist({
        ...updates,
        playlist_id: playlistId,
        last_updated: new Date(),
        old_playlist_dash_url: oldPlaylistDashUrl,
      })

      console.log(newPlaylist)

      await newPlaylist.save()
      userPlaylistToBeEdited.edits_left -= 1
      await userPlaylistToBeEdited.save()
      res.status(200).json({
        message: 'Playlist updated successfully',
        playlist: newPlaylist,
      })
    }
  } catch (error) {
    console.error('Error updating playlist:', error)
    res.status(500).json({ error: 'Failed to update playlist' })
  }
})

router.post('/delete', async (req, res) => {
  const { user_id, playlistId } = req.body
  const currentMonth = new Date().toISOString().slice(0, 7)

  try {
    // Fetch all UserPlaylist documents for this user in the current month
    const userPlaylists = await UserPlaylist.find({
      user_id,
      month: currentMonth,
    })

    if (!userPlaylists.length) {
      return res.status(404).json({ message: 'User has no playlists' })
    }

    // Fetch the playlist document
    const playlistObject = await Playlist.findOne({ playlist_id: playlistId })

    if (!playlistObject) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    const playlistObjectId = new mongoose.Types.ObjectId(playlistObject._id)

    let playlistFound = false

    // Loop through all user playlists and remove the playlist ID
    for (let userPlaylist of userPlaylists) {
      if (userPlaylist.playlists.some((id) => id.equals(playlistObjectId))) {
        await UserPlaylist.findOneAndDelete({ _id: userPlaylist._id })

        // userPlaylist.playlists = userPlaylist.playlists.filter(
        //   (id) => !id.equals(playlistObjectId)
        // )
        // await userPlaylist.save()
        playlistFound = true
        break
      }
    }

    if (!playlistFound) {
      return res
        .status(404)
        .json({ message: 'Playlist not found in user playlists' })
    }

    // Delete the actual playlist

    await Playlist.findByIdAndDelete(playlistObjectId)

    res.json({ message: 'Playlist deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete playlist' })
  }
})

router.post('/carry-forward', async (req, res) => {
  const { user_id, carry_forward_ids } = req.body // Array of playlist IDs user wants to keep
  const currentMonth = new Date().toISOString().slice(0, 7)

  try {
    let newSubscription = await UserPlaylist.findOne({
      user_id,
      month: currentMonth,
    })

    if (newSubscription) {
      return res
        .status(400)
        .json({ message: 'Subscription already exists for this month.' })
    }

    newSubscription = new UserPlaylist({
      user_id,
      month: currentMonth,
      playlists: carry_forward_ids,
      edits_left: 2,
    })

    await newSubscription.save()

    res.json({
      message: 'Playlists carried forward successfully',
      newSubscription,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to carry forward playlists' })
  }
})

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params
  const currentMonth = new Date().toISOString().slice(0, 7)

  try {
    const userPlaylists = await UserPlaylist.find({
      user_id: userId,
      month: currentMonth,
    }).populate('playlists') // Populates the playlists for each document

    const userPlaylistsOg = await UserPlaylist.find({
      user_id: userId,
      month: currentMonth,
    }) // Populates the playlists for each document

    if (!userPlaylists || userPlaylists.length === 0) {
      return res.json({
        message: 'No playlists found for this month.',
        playlists: [],
      })
    }

    // Flatten all playlists from multiple documents into a single array
    const allPlaylists = userPlaylists.flatMap((doc) => doc.playlists)
    const totalEditsLeft = userPlaylists.reduce(
      (sum, doc) => sum + doc.edits_left,
      0
    )

    console.log('User Playlists:', userPlaylists) // Debugging output

    res.json({
      userPlaylists: userPlaylistsOg,
      playlists: allPlaylists, // Send all collected playlists
      edits_left: totalEditsLeft, // Sum of remaining edits across documents
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch user playlists' })
  }
})

module.exports = router
