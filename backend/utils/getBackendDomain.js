const dotenv = require('dotenv')
dotenv.config()

function getBackendDomain() {
  return process.env.BACKEND_DOMAIN || 'http://localhost:4000'
}

module.exports = getBackendDomain
