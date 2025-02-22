const express = require('express')
const router = express.Router()
const UserPlaylist = require('../models/mongo/UserPlaylist')
const Playlist = require('../models/mongo/Playlist')
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
    let userPlaylists = await UserPlaylist.findOne({
      user_id,
      month: currentMonth,
    })

    if (userPlaylists && userPlaylists.playlists.length >= 2) {
      return res
        .status(400)
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
    if (!userPlaylists) {
      userPlaylists = new UserPlaylist({
        user_id,
        month: currentMonth,
        playlists: [],
        edits_left: 2,
      })
    }

    userPlaylists.playlists.push(newPlaylist._id)
    await userPlaylists.save()

    res
      .status(201)
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
    const userPlaylists = await UserPlaylist.findOne({
      user_id,
      month: currentMonth,
    })

    if (!userPlaylists || userPlaylists.edits_left <= 0) {
      return res.status(400).json({ message: 'No edits left for this month.' })
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      playlist[key] = updates[key]
    })
    playlist.last_updated = new Date()

    await playlist.save()

    // Deduct edit count
    userPlaylists.edits_left -= 1
    await userPlaylists.save()

    res.json({ message: 'Playlist updated successfully', playlist })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to edit playlist' })
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
    const userPlaylists = await UserPlaylist.findOne({
      user_id: userId,
      month: currentMonth,
    }).populate('playlists')

    if (!userPlaylists) {
      return res.json({
        message: 'No playlists found for this month.',
        playlists: [],
      })
    }

    res.json({
      playlists: userPlaylists.playlists,
      edits_left: userPlaylists.edits_left,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch user playlists' })
  }
})

// router.get('/getAllUserPlaylists/:user_id', async (req, res) => {
//   try {
//     const user_id = Number(req.params['user_id'])
//     const userPlaylists = await UserPlaylist.find({
//       playlist_user_id: user_id,
//     })
//     res.json(userPlaylists)
//   } catch (error) {
//     console.error(error)
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: 'Failed to fetch videos',
//     })
//   }
// })

// router.post('/addUserPlaylist', async (req, res) => {
//   try {
//     const requestData = req.body
//     console.log(requestData)
//     const newUserPlaylist = new UserPlaylist(requestData)
//     const savedUserPlaylist = await newUserPlaylist.save()
//     res.status(200).json(savedUserPlaylist)
//   } catch (error) {
//     console.error('Error saving new Playlist:', error)
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: 'Failed to save new Playlist',
//     })
//   }
// })

// router.put('/updateUserPlaylist/:playlistId', async (req, res) => {
//   const playlistId = req.params.playlistId
//   const updatedData = req.body
//   try {
//     const existingPlaylist = await UserPlaylist.findOne({
//       playlist_id: playlistId,
//     })
//     if (!existingPlaylist) {
//       return res.status(HTTP_NOT_FOUND).json({ error: 'Playlist not found' })
//     }
//     const mergedData = {
//       ...existingPlaylist.toObject(),
//       ...updatedData,
//     }
//     const updatedPlaylist = await UserPlaylist.findOneAndUpdate(
//       { playlist_id: playlistId },
//       mergedData,
//       {
//         new: true,
//       }
//     )
//     res.json(updatedPlaylist)
//   } catch (error) {
//     console.error(error)
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: 'Failed to update Playlist',
//     })
//   }
// })

// router.delete('/deleteUserPlaylist/:playlistId', async (req, res) => {
//   const playlistId = req.params.playlistId
//   try {
//     const deletedPlaylist = await UserPlaylist.findOneAndDelete({
//       playlist_id: playlistId,
//     })
//     if (deletedPlaylist) {
//       res.status(HTTP_OK).json({
//         message: 'Playlist deleted successfully',
//       })
//     } else {
//       res.status(HTTP_NOT_FOUND).json({ message: 'Playlist not found' })
//     }
//   } catch (error) {
//     console.error(error)
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: 'Failed to delete Playlist',
//     })
//   }
// })
module.exports = router
