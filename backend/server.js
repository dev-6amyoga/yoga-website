const express = require('express')
const requestIp = require('request-ip')

const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const useragent = require('express-useragent')
const path = require('path')
const compression = require('compression')
const helmet = require('helmet')
const glob = require('glob')
const expressWs = require('express-ws')

// const RateLimit = require('express-rate-limit')

// init the config from .env file
dotenv.config()

// console.log({ env: process.env });

// init the sequelize, nodemailer
const { initializeSequelize } = require('./init.sequelize')
// const { mailTransporter } = require('./init.nodemailer')

// sql models

glob.sync('./models/sql/*.js').forEach((file) => {
  require(path.resolve(file))
})

glob.sync('./models/mongo/*.js').forEach((file) => {
  require(path.resolve(file))
})

// routers
const asanaRouter = require('./routes/Asana')
const authRouter = require('./routes/Auth')
const instituteRouter = require('./routes/Institute')
const userRouter = require('./routes/User')
const playlistRouter = require('./routes/Playlist')
const scheduleRouter = require('./routes/Schedule')
const planRouter = require('./routes/Plan')
const userPlanRouter = require('./routes/UserPlan')
const currencyRouter = require('./routes/Currency')
const referralCodeRouter = require('./routes/ReferralCode')
const userPlaylistRouter = require('./routes/PlaylistUser')
const inviteRouter = require('./routes/Invite')
const customPlanRouter = require('./routes/CustomPlan')
const paymentRouter = require('./routes/Payment')
const userInstituteRouter = require('./routes/UserInstitute')
const discountCouponRouter = require('./routes/DiscountCoupon')
const transactionRouter = require('./routes/Transaction')
const teacherPlaylistRouter = require('./routes/TeacherPlaylist')
const userInstitutePlanRoleRouter = require('./routes/UserInstitutePlanRole')
const institutePlaylistRouter = require('./routes/InstitutePlaylist')
const planPricingRouter = require('./routes/PlanPricing')
const invoiceRouter = require('./routes/Invoice')
const watchHistoryRouter = require('./routes/WatchHistory')
const watchTimeLogRouter = require('./routes/WatchTimeLog')
const customUserPlanRouter = require('./routes/CustomUserPlan')
const queryRouter = require('./routes/Queries')
const updateRequestsRouter = require('./routes/UpdateRequests')
const playlistConfigsRouter = require('./routes/PlaylistConfigs')
const playbackRouter = require('./routes/Playback')
const classRouter = require('./routes/Class')
const postureRouter = require('./routes/Posture')
const otpRouter = require('./routes/OTP')

// ws routers

const classWsRouter = require('./websocket-routes/Class')

// DEV : sample data creation
// const { bulkCreateSampleData } = require('./sample_data')
const getFrontendDomain = require('./utils/getFrontendDomain')
// const helloWorld = require("./defer/helloWorld");

const corsOptions = {
  origin: [
    'https://my-yogateacher.6amyoga.com',
    `${getFrontendDomain()}`,
    'https://www.my-yogateacher.6amyoga.com',
    'https://www.ai.6amyoga.com',
    'https://ai.6amyoga.com',
    'https://yoga-website-orcin.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://my-yogateacher-player.6amyoga.com',
    'https://www.my-yogateacher-player.6amyoga.com',
    'http://my-yogateacher-player.6amyoga.com',
    'http://www.my-yogateacher-player.6amyoga.com',
    'https://my-yogateacher-48ee4315f8b4.herokuapp.com/',
  ],
  optionSuccessStatus: 200,
}

const app = express()

expressWs(app)

// allow everything
// const corsOptions = {
//   origin: "*",
//   optionSuccessStatus: 200,
// };

// middleware
app.use(cors(corsOptions))

// parse json body
app.use(express.json())

// logging
app.use(
  morgan((tokens, req, res) =>
    [
      tokens.date(req, res, 'iso'),
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ')
  )
)

// parsing user agent
app.use(useragent.express())

// compressing response
app.use(compression())

// getting ip address
app.use(requestIp.mw())

// securing the app with CSP policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  })
)

// Apply rate limiter to all requests
// const limiter = RateLimit({
//   windowMs: 30 * 1000, // 30s
//   max: process.env.NODE_ENV === 'production' ? 100 : 1000,
// })

//   app.use(limiter);

// static files
app.use('/static', express.static(path.join(__dirname, 'public')))

// initialize databases
const mongoURI = process.env.MONGO_SRV_URL
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.log(err))

initializeSequelize()
  .then(() => {
    console.log('Sequelize initialized')
    // bulkCreateSampleData()
    //   .then(() => {
    //     console.log("Sample data created!");
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  })
  .catch((err) => {
    console.error(err)
  })

app.get('/info', async (req, res) =>
  res.status(200).json({
    message: 'Running.',
  })
)

app.get('/error', async (req, res) =>
  res.status(500).json({
    message: 'Error.',
  })
)

app.use('/content', asanaRouter)
app.use('/content', playlistRouter)
app.use('/schedule', scheduleRouter)
app.use('/user', userRouter)
app.use('/auth', authRouter)
app.use('/plan', planRouter)
app.use('/user-plan', userPlanRouter)
app.use('/currency', currencyRouter)
app.use('/referral', referralCodeRouter)
app.use('/user-playlists', userPlaylistRouter)
app.use('/institute', instituteRouter)
app.use('/institute-playlist', institutePlaylistRouter)
app.use('/invite', inviteRouter)
app.use('/payment', paymentRouter)
app.use('/user-institute', userInstituteRouter)
app.use('/discount-coupon', discountCouponRouter)
app.use('/transaction', transactionRouter)
app.use('/teacher-playlist', teacherPlaylistRouter)
app.use('/uipr', userInstitutePlanRoleRouter)
app.use('/plan-pricing', planPricingRouter)
app.use('/invoice', invoiceRouter)
app.use('/watch-history', watchHistoryRouter)
app.use('/watch-time', watchTimeLogRouter)
app.use('/query', queryRouter)
app.use('/update-request', updateRequestsRouter)
app.use('/playlist-configs', playlistConfigsRouter)
app.use('/playback', playbackRouter)
app.use('/class', classRouter)
app.use('/posture', postureRouter)
app.use('/otp', otpRouter)
app.use('/customPlan', customPlanRouter)
app.use('/customUserPlan', customUserPlanRouter)

// ws routers
// app.use('/ws/class', classWsRouter)
app.ws('/ws/class/teacher', classWsRouter.handleTeacherConnection)

app.ws('/ws/class/student', classWsRouter.handleStudentConnection)

const port = parseInt(process.env.PORT, 10)

app.listen(port || 4000, () => {
  console.log(`Server is running on port ${port}`)
})
