const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

// routers
const asanaRouter = require('./routes/Asana');
const authRouter = require('./routes/Auth');
const userRouter = require('./routes/User');
const playlistRouter = require('./routes/Playlist');

app.use(cors());
app.use(express.json());

const mongoURI =
    'mongodb+srv://smriti030202:pass,123@yogawebsite.lxvodui.mongodb.net/YogaWebsite';
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.log(err));

// bind routers
app.use('/', asanaRouter);
app.use('/', authRouter);
app.use('/', userRouter);
app.use('/', playlistRouter);

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
