import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import axios from 'axios'
import { tmpdir } from 'os'

const TEMP_DIR = path.join(tmpdir(), 'shaka_temp_videos')
const EXPIRATION_MS = 24 * 60 * 60 * 1000 // 24 hours

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

const cleanUpTempDir = async () => {
  console.log('cleaning!')
  const files = await promisify(fs.readdir)(TEMP_DIR)
  const now = Date.now()

  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file)
    const stats = await promisify(fs.stat)(filePath)

    if (now - stats.mtimeMs > EXPIRATION_MS) {
      console.log(`[CleanUp] Deleting expired file: ${filePath}`)
      await promisify(fs.unlink)(filePath)
    }
  }
}

const getVideoFromTempOrDownload = async (uri, videoTitle) => {
  const fileName = `${videoTitle.replace(/\s+/g, '_')}.mp4`
  const filePath = path.join(TEMP_DIR, fileName)

  if (fs.existsSync(filePath)) {
    console.log(`[VideoFetch] File exists in temp: ${filePath}`)
    return filePath
  }

  console.log(`[VideoFetch] Downloading video: ${uri}`)
  const response = await axios({
    url: uri,
    method: 'GET',
    responseType: 'stream',
  })

  const writer = fs.createWriteStream(filePath)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`[VideoFetch] File downloaded to temp: ${filePath}`)
      resolve(filePath)
    })
    writer.on('error', (err) => {
      console.error(`[VideoFetch] Error downloading video: ${err}`)
      reject(err)
    })
  })
}

// setInterval(cleanUpTempDir, 60 * 60 * 1000) // Run every hour

// import fs from 'fs'
// import path from 'path'
// import { promisify } from 'util'
// import axios from 'axios'
// import { tmpdir } from 'os'
// import ShakaOfflineStore from './ShakaOfflineStore' // Assuming your ShakaOfflineStore is imported here

// const TEMP_DIR = path.join(tmpdir(), 'shaka_temp_videos')
// const EXPIRATION_MS = 24 * 60 * 60 * 1000 // 24 hours

// if (!fs.existsSync(TEMP_DIR)) {
//   fs.mkdirSync(TEMP_DIR, { recursive: true })
// }

// const cleanUpTempDir = async () => {
//   console.log('cleaning!')
//   const files = await promisify(fs.readdir)(TEMP_DIR)
//   const now = Date.now()

//   for (const file of files) {
//     const filePath = path.join(TEMP_DIR, file)
//     const stats = await promisify(fs.stat)(filePath)

//     if (now - stats.mtimeMs > EXPIRATION_MS) {
//       console.log(`[CleanUp] Deleting expired file: ${filePath}`)
//       await promisify(fs.unlink)(filePath)
//     }
//   }
// }

// const getVideoFromTempOrDownload = async (uri, videoTitle, shakaOfflineStore) => {
//   const fileName = `${videoTitle.replace(/\s+/g, '_')}.mp4`
//   const filePath = path.join(TEMP_DIR, fileName)

//   // Check if the video exists in the temp directory
//   if (fs.existsSync(filePath)) {
//     console.log(`[VideoFetch] File exists in temp: ${filePath}`)
//     return filePath
//   }

//   console.log(`[VideoFetch] Downloading video: ${uri}`)
//   try {
//     // Use ShakaOfflineStore to download and store the video
//     let offlineUri = await shakaOfflineStore.get(uri)
//     if (!offlineUri) {
//       console.log(`[VideoFetch] Video not found in offline store, starting download.`)

//       // Assuming DRM or non-DRM logic handled here
//       offlineUri = await shakaOfflineStore.store(uri, videoTitle)

//       console.log(`[VideoFetch] Video stored offline at: ${offlineUri}`)
//     }

//     // After downloading, store the video in the temp directory
//     const response = await axios({
//       url: offlineUri,
//       method: 'GET',
//       responseType: 'stream',
//     })

//     const writer = fs.createWriteStream(filePath)
//     response.data.pipe(writer)

//     return new Promise((resolve, reject) => {
//       writer.on('finish', () => {
//         console.log(`[VideoFetch] File downloaded and saved to temp: ${filePath}`)
//         resolve(filePath)
//       })
//       writer.on('error', (err) => {
//         console.error(`[VideoFetch] Error downloading video: ${err}`)
//         reject(err)
//       })
//     })
//   } catch (err) {
//     console.error(`[VideoFetch] Error in downloading and storing video: ${err}`)
//     throw err
//   }
// }

// // Example usage in your video loading process
// const loadVideo = async (videoUrl, videoTitle, shakaOfflineStore) => {
//   try {
//     const tempFilePath = await getVideoFromTempOrDownload(videoUrl, videoTitle, shakaOfflineStore)
//     console.log(`[Stream] Loading video from temp: ${tempFilePath}`)

//     // Assuming you have a video player instance (playerRef)
//     await playerRef.current.player.load(tempFilePath)
//     console.log('[Stream] Video loaded successfully.')
//   } catch (error) {
//     console.error('[Stream] Error loading video:', error)
//   }
// }

// setInterval(cleanUpTempDir, 60 * 60 * 1000) // Run cleanup every hour
