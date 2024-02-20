const express = require("express");
const requestIp = require("request-ip");

const app = express();
app.use(requestIp.mw());

const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const useragent = require("express-useragent");
const path = require("path");

// init the config from .env file
dotenv.config();

// init the sequelize, nodemailer
const { initializeSequelize } = require("./init.sequelize");
const { mailTransporter } = require("./init.nodemailer");

// sql models
var glob = require("glob");

glob.sync("./models/sql/*.js").forEach(function (file) {
  require(path.resolve(file));
});

glob.sync("./models/mongo/*.js").forEach(function (file) {
  require(path.resolve(file));
});

// routers
const asanaRouter = require("./routes/Asana");
const authRouter = require("./routes/Auth");
const instituteRouter = require("./routes/Institute");
const userRouter = require("./routes/User");
const playlistRouter = require("./routes/Playlist");
const scheduleRouter = require("./routes/Schedule");
const planRouter = require("./routes/Plan");
const userPlanRouter = require("./routes/UserPlan");
const currencyRouter = require("./routes/Currency");
const referralCodeRouter = require("./routes/ReferralCode");
const userPlaylistRouter = require("./routes/PlaylistUser");
const UserPlaylistCountRouter = require("./routes/UserPlaylistCount");
const inviteRouter = require("./routes/Invite");
const paymentRouter = require("./routes/Payment");
const userInstituteRouter = require("./routes/UserInstitute");
const discountCouponRouter = require("./routes/DiscountCoupon");
const transactionRouter = require("./routes/Transaction");
const teacherPlaylistRouter = require("./routes/TeacherPlaylist");
const userInstitutePlanRoleRouter = require("./routes/UserInstitutePlanRole");
const institutePlaylistRouter = require("./routes/InstitutePlaylist");
const planPricingRouter = require("./routes/PlanPricing");
const invoiceRouter = require("./routes/Invoice");
const watchHistoryRouter = require("./routes/WatchHistory");
const watchTimeLogRouter = require("./routes/WatchTimeLog");
const queryRouter = require("./routes/Queries");
const updateRequestsRouter = require("./routes/UpdateRequests");
// DEV : sample data creation
const { bulkCreateSampleData } = require("./sample_data");
const helloWorld = require("./defer/helloWorld");

// middleware
app.use(cors());
app.use(express.json());
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.date(req, res, "iso"),
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);
app.use(useragent.express());
app.use("/static", express.static(path.join(__dirname, "public")));

// initialize databases
const mongoURI = process.env.MONGO_SRV_URL;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log(err));

initializeSequelize()
  .then(() => {
    console.log("Sequelize initialized");
    // bulkCreateSampleData()
    //   .then(() => {
    //     console.log("Sample data created!");
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  })
  .catch((err) => {
    console.error(err);
  });

// bind routers
app.get("/info", async (req, res) => {
  await helloWorld("6AMYOGA_BACKEND");
  return res.status(200).json({
    message: "Running.",
  });
});

app.use("/content", asanaRouter);
app.use("/content", playlistRouter);
app.use("/schedule", scheduleRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/plan", planRouter);
app.use("/user-plan", userPlanRouter);
app.use("/currency", currencyRouter);
app.use("/referral", referralCodeRouter);
app.use("/user-playlists", userPlaylistRouter);
app.use("/user-playlist-count", UserPlaylistCountRouter);
app.use("/institute", instituteRouter);
app.use("/institute-playlist", institutePlaylistRouter);
app.use("/invite", inviteRouter);
app.use("/payment", paymentRouter);
app.use("/user-institute", userInstituteRouter);
app.use("/discount-coupon", discountCouponRouter);
app.use("/transaction", transactionRouter);
app.use("/teacher-playlist", teacherPlaylistRouter);
app.use("/uipr", userInstitutePlanRoleRouter);
app.use("/plan-pricing", planPricingRouter);
app.use("/invoice", invoiceRouter);
app.use("/watch-history", watchHistoryRouter);
app.use("/watch-time", watchTimeLogRouter);
app.use("/query", queryRouter);
app.use("/update-request", updateRequestsRouter);
const port = parseInt(process.env.SERVER_PORT);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
