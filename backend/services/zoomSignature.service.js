const crypto = require('crypto')

const generateSignature = ({ meetingNumber, sdkKey, sdkSecret, role }) => {
  const iat = Math.round(Date.now() / 1000) - 30
  const exp = iat + 60 * 60 * 2
  const oHeader = { alg: 'HS256', typ: 'JWT' }
  const oPayload = {
    sdkKey,
    mn: meetingNumber,
    role,
    iat,
    exp,
    appKey: sdkKey,
    tokenExp: exp,
  }
  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const signature = crypto
    .createHmac('sha256', sdkSecret)
    .update(
      Buffer.from(sHeader).toString('base64') +
        '.' +
        Buffer.from(sPayload).toString('base64')
    )
    .digest('base64')

  return (
    Buffer.from(sHeader).toString('base64') +
    '.' +
    Buffer.from(sPayload).toString('base64') +
    '.' +
    signature
  )
}

module.exports = { generateSignature }
