const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  user_id: Number,
  user_name: String,
  creation_date: Date,
  email_id: String,
  username: String,
  password: String,
  user_type: String,
  institute_id: Number,
  institute_name: String,
});

const asanaSchema = new mongoose.Schema({
  id: Number,
  asana_name: String,
  asana_desc: String,
  asana_category: String,
  asana_imageID: String,
  asana_videoID: String,
  asana_withAudio: String,
  asana_audioLag: Number,
  language: String,
});
const Asana = mongoose.model("Asana", asanaSchema, "asanas");
const Users = mongoose.model("Users", userSchema, "all_users");
const mongoURI =
  "mongodb+srv://smriti030202:pass,123@yogawebsite.lxvodui.mongodb.net/YogaWebsite";
// "mongodb+srv://smriti030202:pass,123@yogawebsite.lxvodui.mongodb.net/?retryWrites=true&w=majority/YogaWebsite";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log(err));

const auth = require("./oauth");

app.post("/verify", async (req, res) => {
  console.log(req.body);
  const { client_id, jwtToken } = req.body;
  try {
    const userInfo = await auth.verify(client_id, jwtToken);
    res.json(userInfo);
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Authentication failed" });
  }
});

app.get("/allUsers", async (req, res) => {
  try {
    const users = await Users.find();
    console.log(users);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
app.get("/content/video/getAllAsanas", async (req, res) => {
  try {
    const asanas = await Asana.find();
    console.log(asanas);
    res.json(asanas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
