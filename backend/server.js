const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const asanaRouter = require("./routes/Asana");
const authRouter = require("./routes/Auth");
const userRouter = require("./routes/User");
const playlistRouter = require("./routes/Playlist");

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_SRV_URL;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log(err));

// bind routers
app.use("/", asanaRouter);
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", playlistRouter);

const port = parseInt(process.env.SERVER_PORT);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
