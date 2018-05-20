const config = require("../../config");
const mongoose = require("mongoose");
const shop = require("../../models/shop");

mongoose.Promise = global.Promise;
mongoose.connect(config.db, (err) => {
	if (!err) {
		console.log("MongoDB Connected");
	} else {
		console.log(err);
	}
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
