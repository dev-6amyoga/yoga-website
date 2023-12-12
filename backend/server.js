const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// sql models
const { initializeSequelize } = require('./init.sequelize');
const { Role } = require('./models/sql/Role');
const { User } = require('./models/sql/User');
const { Institute } = require('./models/sql/Institute');
const { Permission } = require('./models/sql/Permission');
const { Plan } = require('./models/sql/Plan');
const { PlanPricing } = require('./models/sql/PlanPricing');
const { UserPlan } = require('./models/sql/UserPlan');
const { ReferralCode } = require('./models/sql/ReferralCode');
const { ReferralCodeUsage } = require('./models/sql/ReferralCodeUsage');
const { Currency } = require('./models/sql/Currency');
const { Transaction } = require('./models/sql/Transaction');
const { DiscountCoupon } = require('./models/sql/DiscountCoupon');
const {
    DiscountCouponApplicablePlan,
} = require('./models/sql/DiscountCouponApplicablePlan');

require('dotenv').config();

const asanaRouter = require('./routes/Asana');
const authRouter = require('./routes/Auth');
const userRouter = require('./routes/User');
const playlistRouter = require('./routes/Playlist');
const planRouter = require('./routes/Plan');
const { bulkCreateSampleData } = require('./sample_data');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const mongoURI = process.env.MONGO_SRV_URL;
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.log(err));

initializeSequelize()
    .then(() => {
        console.log('Sequelize initialized');
        // bulkCreateSampleData();
    })
    .catch((err) => {
        console.log(err);
    });

// bind routers

app.use('/', asanaRouter);
app.use('/', playlistRouter);
app.use('/user', userRouter);
app.use('/', authRouter);
app.use('/', planRouter);
const port = parseInt(process.env.SERVER_PORT);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
