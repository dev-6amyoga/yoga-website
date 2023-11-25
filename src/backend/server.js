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
  phone_number: String,
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

const PlaylistSchema6am = new mongoose.Schema({
  playlist_id: { type: Number, required: true },
  playlist_name: String,
  asana_ids: [Number],
});

const Asana = mongoose.model("Asana", asanaSchema, "asanas");
const Users = mongoose.model("Users", userSchema, "all_users");
const Playlists = mongoose.model(
  "Playlists",
  PlaylistSchema6am,
  "6amyoga_playlists"
);

module.exports = Asana;
module.exports = Users;
module.exports = Playlists;

const auth = require("./oauth");
const mongoURI =
  "mongodb+srv://smriti030202:pass,123@yogawebsite.lxvodui.mongodb.net/YogaWebsite";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log(err));

////////////////////////////////////////////////////////////////////////////////////

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

app.post("/content/video/addAsana", async (req, res) => {
  try {
    const requestData = req.body;
    const newAsana = new Asana(requestData);
    const savedAsana = await newAsana.save();
    res.status(201).json(savedAsana);
  } catch (error) {
    console.error("Error saving new Asana:", error);
    res.status(500).json({ error: "Failed to save new Asana" });
  }
});

app.post("/addUser", async (req, res) => {
  try {
    const requestData = req.body;
    const newUser = new Users(requestData);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error saving new Asana:", error);
    res.status(500).json({ error: "Failed to save new Asana" });
  }
});

app.post("/addPlaylist", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdPlaylist = await Playlists.findOne(
      {},
      {},
      { sort: { playlist_id: -1 } }
    );
    const newPlaylistId = maxIdPlaylist ? maxIdPlaylist.playlist_id + 1 : 1;
    console.log(newPlaylistId, maxIdPlaylist);
    requestData.playlist_id = newPlaylistId;
    const newPlaylist = new Playlists(requestData);
    const savedPlaylist = await newPlaylist.save();
    res.status(201).json(savedPlaylist);
  } catch (error) {
    console.error("Error saving new Playlist:", error);
    res.status(500).json({ error: "Failed to save new Playlist" });
  }
});

////////////////////////////////////////////////////////////////////////////////////

app.put("/content/video/updateAsana/:asanaId", async (req, res) => {
  const asanaId = req.params.asanaId;
  const updatedData = req.body;
  try {
    const existingAsana = await Asana.findOne({ id: asanaId });
    if (!existingAsana) {
      return res.status(404).json({ error: "Asana not found" });
    }
    const mergedData = { ...existingAsana.toObject(), ...updatedData };
    const updatedAsana = await Asana.findOneAndUpdate(
      { id: asanaId },
      mergedData,
      {
        new: true,
      }
    );
    res.json(updatedAsana);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Asana" });
  }
});

////////////////////////////////////////////////////////////////////////////////////

app.delete("/content/video/deleteAsana/:asanaId", async (req, res) => {
  const asanaId = req.params.asanaId;
  try {
    const deletedAsana = await Asana.findOneAndDelete({ id: asanaId });
    if (deletedAsana) {
      res.status(200).json({ message: "Asana deleted successfully" });
    } else {
      res.status(404).json({ message: "Asana not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete asana" });
  }
});

////////////////////////////////////////////////////////////////////////////////////

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

app.get("/content/playlists/getAllPlaylists", async (req, res) => {
  try {
    const playlists = await Playlists.find();
    console.log(playlists);
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});
////////////////////////////////////////////////////////////////////////////////////

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
