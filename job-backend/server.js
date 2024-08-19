const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
// const logger = require("pino-http");
const dotenv = require("dotenv");
const compression = require("compression");
const helmet = require("helmet");
const glob = require("glob");

const HyperExpress = require("hyper-express");

const bodyParser = require("body-parser");

const path = require("path");

// const RateLimit = require('express-rate-limit')

// init the config from .env file
dotenv.config();

// sql models

glob.sync("./models/sql/*.js").forEach((file) => {
	require(path.resolve(file));
});

glob.sync("./models/mongo/*.js").forEach((file) => {
	require(path.resolve(file));
});

// routers

// ws routers

// DEV : sample data creation
// const { bulkCreateSampleData } = require('./sample_data')
const getFrontendDomain = require("./utils/getFrontendDomain");
// const helloWorld = require("./defer/helloWorld");

const corsOptions = {
	origin: [
		"https://my-yogateacher.6amyoga.com",
		`${getFrontendDomain()}`,
		"https://www.my-yogateacher.6amyoga.com",
		"https://www.ai.6amyoga.com",
		"https://ai.6amyoga.com",
		"https://yoga-website-orcin.vercel.app",
		"http://localhost:3000",
		"http://localhost:3001",
		"https://my-yogateacher-player.6amyoga.com",
		"https://www.my-yogateacher-player.6amyoga.com",
		"http://my-yogateacher-player.6amyoga.com",
		"http://www.my-yogateacher-player.6amyoga.com",
		"https://my-yogateacher-48ee4315f8b4.herokuapp.com/",
		"*",
	],
	optionSuccessStatus: 200,
};

const app = new HyperExpress.Server();

// allow everything
// const corsOptions = {
//   origin: "*",
//   optionSuccessStatus: 200,
// };

// middleware
app.use(cors(corsOptions));

// parse json body
// app.use(bodyParser.json());

// logging
app.use(
	morgan((tokens, req, res) =>
		[
			tokens.date(req, res, "iso"),
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
		].join(" ")
	)
);

// app.use(
// 	logger({
// 		customAttributeKeys: {
// 			req: "request",
// 			// res: "response",
// 			// err: "error",
// 			responseTime: "timeTaken",
// 		},
// 	})
// );

// parsing user agent
// app.use(useragent.express());

// compressing response
app.use(compression());

// getting ip address
// app.use(requestIp.mw());

// securing the app with CSP policy
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			"script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
		},
	})
);

// Apply rate limiter to all requests
// const limiter = RateLimit({
//   windowMs: 30 * 1000, // 30s
//   max: process.env.NODE_ENV === 'production' ? 100 : 1000,
// })

//   app.use(limiter);

// static files
// app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/video-processing", require("./routes/VideoProcessing"));

// initialize databases
const mongoURI = process.env.MONGO_SRV_URL;
mongoose
	.connect(mongoURI)
	.then(() => console.log("Connected to MongoDB Atlas"))
	.catch((err) => console.log(err));

app.get("/info", async (req, res) =>
	res.status(200).json({
		message: "Running.",
	})
);

const port = parseInt(process.env.PORT, 10);

app.listen(port || 4000).then(() => {
	console.log(`Server is running on port ${port}`);
});
