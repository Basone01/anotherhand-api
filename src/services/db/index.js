const config = require('../../config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(config.db, (err) => {
	if (!err) {
		console.log('MongoDB Connected');
	}
	else {
		console.log(err);
	}
});



db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
