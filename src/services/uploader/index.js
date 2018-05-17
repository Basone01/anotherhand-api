const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
	destination: path.join(__dirname, "../../public/uploads"),
	filename: function(req, file, callback) {
		callback(
			null,
			`${file.fieldname}-${Math.floor(Math.random() * 100)}-${Date.now()}`
		);
	}
});

const Uploader = multer({ storage });

module.exports = Uploader;
