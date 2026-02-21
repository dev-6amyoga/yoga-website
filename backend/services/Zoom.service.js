const axios = require('axios')
const crypto = require('crypto')

let cachedToken = null
let tokenExpiry = null

const getZoomAccessToken = async () => {
  try {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken
    }

    const response = await axios.post(`https://zoom.us/oauth/token`, null, {
      params: {
        grant_type: 'account_credentials',
        account_id: process.env.ZOOM_ACCOUNT_ID,
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET,
      },
    })

    cachedToken = response.data.access_token
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000

    return cachedToken
  } catch (error) {
    console.error('Zoom token error:', error.response?.data || error.message)
    throw new Error('Failed to fetch Zoom access token')
  }
}

const rotatePMIPassword = async () => {
  try {
    const accessToken = await getZoomAccessToken()
    const newPassword = require('crypto').randomBytes(4).toString('hex')

    await axios.patch(
      `https://api.zoom.us/v2/users/me/settings`,
      {
        schedule_meeting: {
          pmi_password: newPassword,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return newPassword
  } catch (error) {
    console.error(
      'Zoom password rotation error:',
      error.response?.data || error.message
    )
    throw new Error('Failed to rotate PMI password')
  }
}

const getEncryptedPassword = async (meetingId) => {
  try {
    const accessToken = await getZoomAccessToken()

    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.data.encrypted_password
  } catch (error) {
    console.error(
      'Zoom encrypted password fetch error:',
      error.response?.data || error.message
    )
    throw new Error('Failed to fetch encrypted password')
  }
}

const constructZoomJoinUrl = (meetingId, encryptedPassword) => {
  return `https://us02web.zoom.us/j/${meetingId}?pwd=${encryptedPassword}&omn=${meetingId}`
}

module.exports = {
  getZoomAccessToken,
  rotatePMIPassword,
  getEncryptedPassword,
  constructZoomJoinUrl,
}
