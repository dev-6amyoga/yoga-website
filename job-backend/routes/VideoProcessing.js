const HyperExpress = require("hyper-express");

const router = new HyperExpress.Router();

router.get("/1", async (req, res) => {
	return res.status(200).json({
		message: "This is the video-processing endpoint",
	});
});

module.exports = router;
