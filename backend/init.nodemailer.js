const nodemailer = require('nodemailer');

const dotenv = require('dotenv');

const conf = dotenv.config();

const {
    NODEMAILER_SERVICE,
    EMAIL_USER,
    EMAIL_PASS,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN,
} = process.env;

module.exports = {
    mailTransporter: nodemailer.createTransport({
        service: NODEMAILER_SERVICE,
        auth: {
            type: 'OAuth2',
            user: EMAIL_USER,
            pass: EMAIL_PASS,
            clientId: OAUTH_CLIENT_ID,
            clientSecret: OAUTH_CLIENT_SECRET,
            refreshToken: OAUTH_REFRESH_TOKEN,
        },
    }),
};
