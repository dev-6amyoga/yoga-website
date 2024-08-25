const express = require('express')
const { authenticateToken } = require('../utils/jwt')
const router = express.Router()

const dotenv = require('dotenv')
const {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} = require('../utils/http_status_codes')

dotenv.config()

router.post('/get-playready-token', async (req, res) => {
  // call the playback service to get the token
  try {
    console.log('get-playready-token')
    const r = await fetch(
      `https://pr-gen.service.expressplay.com/hms/pr/token?customerAuthenticator=${process.env.EXPRESSPLAY_API_KEY}&errorFormat=json&kid=${process.env.EXPRESSPLAY_KID}&contentKey=${process.env.EXPRESSPLAY_CONTENT_KEY}&rightsType=BuyToOwn&uncompressedDigitalVideoOPL=0&compressedDigitalVideoOPL=0&uncompressedDigitalAudioOPL=0&compressedDigitalAudioOPL=0&analogVideoOPL=0&useHttps=true`
    )
    const data = await r.json()
    res.status(HTTP_OK).json(data)
  } catch (error) {
    console.error('Error fetching token:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Error fetching token',
    })
  }
})

router.post('/get-widevine-token', async (req, res) => {
  // call the playback service to get the token
  try {
    console.log('get-widevine-token')
    const r = await fetch(
      `https://wv-gen.service.expressplay.com/hms/wv/token?customerAuthenticator=${process.env.EXPRESSPLAY_API_KEY}&errorFormat=json&kid=${process.env.EXPRESSPLAY_KID}&contentKey=${process.env.EXPRESSPLAY_CONTENT_KEY}&useHttps=true`
    )
    const data = await r.text()
    // console.log(r, data);
    res.status(HTTP_OK).json({ licenseAcquisitionUrl: data })
  } catch (error) {
    console.error('Error fetching token:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Error fetching token',
    })
  }
})

module.exports = router
