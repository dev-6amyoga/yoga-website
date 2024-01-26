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
const { UserPlan } = require("./models/sql/UserPlan");
const { Role } = require("./models/sql/Role");
const { User } = require("./models/sql/User");
const { Permission } = require("./models/sql/Permission");
const { RolePermission } = require("./models/sql/RolePermission");
const { LoginToken } = require("./models/sql/LoginToken");
const { LoginHistory } = require("./models/sql/LoginHistory");
const { Institute } = require("./models/sql/Institute");
// const { UserInstitute } = require("./models/sql/UserInstitute");
const { Plan } = require("./models/sql/Plan");
const { PlanPricing } = require("./models/sql/PlanPricing");
const { ReferralCode } = require("./models/sql/ReferralCode");
const { ReferralCodeUsage } = require("./models/sql/ReferralCodeUsage");
const { Currency } = require("./models/sql/Currency");
const { Transaction } = require("./models/sql/Transaction");
const { DiscountCoupon } = require("./models/sql/DiscountCoupon");
const {
  DiscountCouponApplicablePlan,
} = require("./models/sql/DiscountCouponApplicablePlan");
const { Invite } = require("./models/sql/Invite");
const { EmailVerification } = require("./models/sql/EmailVerification");
// routers
const asanaRouter = require("./routes/Asana");
const authRouter = require("./routes/Auth");
const instituteRouter = require("./routes/Institute");
const userRouter = require("./routes/User");
const playlistRouter = require("./routes/Playlist");
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

// DEV : sample data creation
const { bulkCreateSampleData } = require("./sample_data");

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
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
    // 	.then(() => {
    // 		console.log("Sample data created!");
    // 	})
    // 	.catch((err) => {
    // 		console.log(err);
    // 	});
  })
  .catch((err) => {
    console.log(err);
  });

// bind routers
app.get("/info", (req, res) => {
  return res.status(200).json({
    message: "Running.",
  });
});

app.use("/content", asanaRouter);
app.use("/content", playlistRouter);
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

const port = parseInt(process.env.SERVER_PORT);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
