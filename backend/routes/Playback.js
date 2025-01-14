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

    // `https://pr-gen.service.expressplay.com/hms/pr/token?customerAuthenticator=${process.env.EXPRESSPLAY_API_KEY}&errorFormat=json&kid=${process.env.EXPRESSPLAY_KID}&contentKey=${process.env.EXPRESSPLAY_CONTENT_KEY}&generalFlags=00000001&rightsType=Rental&prFlag=true&rental.playDuration=60&uncompressedDigitalVideoOPL=0&compressedDigitalVideoOPL=0&uncompressedDigitalAudioOPL=0&compressedDigitalAudioOPL=0&analogVideoOPL=0&useHttps=true`

    const r = await fetch(
      // `https://pr-gen.service.expressplay.com/hms/pr/token?customerAuthenticator=${process.env.EXPRESSPLAY_API_KEY}&errorFormat=json&kid=${process.env.EXPRESSPLAY_KID}&contentKey=${process.env.EXPRESSPLAY_CONTENT_KEY}&generalFlags=00000001&rightsType=BuyToOwn&uncompressedDigitalVideoOPL=0&compressedDigitalVideoOPL=0&uncompressedDigitalAudioOPL=0&compressedDigitalAudioOPL=0&analogVideoOPL=0&useHttps=true`
      `https://pr-gen.service.expressplay.com/hms/pr/token?customerAuthenticator=${process.env.EXPRESSPLAY_API_KEY}&errorFormat=json&kid=${process.env.EXPRESSPLAY_KID}&contentKey=${process.env.EXPRESSPLAY_CONTENT_KEY}&generalFlags=00000001&rightsType=Rental&rental.periodEndTime=%2B3600&prFlag=true&rental.playDuration=60&uncompressedDigitalVideoOPL=0&compressedDigitalVideoOPL=0&uncompressedDigitalAudioOPL=0&compressedDigitalAudioOPL=0&analogVideoOPL=0&useHttps=true`
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
    const r = await fetch(
      `https://wv-gen.service.expressplay.com/hms/wv/token?customerAuthenticator=${process.env.EXPRESSPLAY_API_KEY}&errorFormat=json&kid=${process.env.EXPRESSPLAY_KID}&contentKey=${process.env.EXPRESSPLAY_CONTENT_KEY}&generalFlags=00000001&rightsType=Rental&prFlag=true&rental.playDuration=60&uncompressedDigitalVideoOPL=0&compressedDigitalVideoOPL=0&uncompressedDigitalAudioOPL=0&compressedDigitalAudioOPL=0&analogVideoOPL=0&useHttps=true`
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

router.post('/get-fairplay-token', async (req, res) => {
  try {
    const r = await fetch(
      `https://fp-gen.service.expressplay.com/hms/fp/token?customerAuthenticator=${process.env.EXPRESSPLAY_API_KEY}&errorFormat=json&kid=${process.env.EXPRESSPLAY_KID}&contentKey=${process.env.EXPRESSPLAY_CONTENT_KEY}&generalFlags=00000001&rightsType=Rental&prFlag=true&rental.playDuration=60&uncompressedDigitalVideoOPL=0&compressedDigitalVideoOPL=0&uncompressedDigitalAudioOPL=0&compressedDigitalAudioOPL=0&analogVideoOPL=0&useHttps=true&iv=${process.env.IV}`
    )
    const data = await r.text()
    res.status(HTTP_OK).json({ licenseAcquisitionUrl: data })
  } catch (error) {
    console.error('Error fetching token:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Error fetching token',
    })
  }
})

https: module.exports = router
