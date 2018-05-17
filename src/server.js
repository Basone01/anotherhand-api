const config = require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const app = express();
const FFA = require('./services/imageProcesser/compare')
const port = process.env.PORT || 3000;

const db = require("./services/db");
const applyRoutes = require("./routes");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger("dev"));

applyRoutes(app);

app.get("/", (req, res) => {
	FFA()
	res.send("ROOT");
});



app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
