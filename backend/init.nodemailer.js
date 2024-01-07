const nodemailer = require("nodemailer");

const dotenv = require("dotenv");

const conf = dotenv.config();

const {
  NODEMAILER_SERVICE,
  EMAIL_USER,
  EMAIL_PASS,
  // OAUTH_CLIENT_ID,
  // OAUTH_CLIENT_SECRET,
  // OAUTH_REFRESH_TOKEN,
} = process.env;

module.exports = {
  mailTransporter: nodemailer.createTransport({
    service: NODEMAILER_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  }),
};
