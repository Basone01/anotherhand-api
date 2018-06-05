const config = require("../../config");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(config.db, (err) => {
	if (!err) {
		console.log("MongoDB Connected");
		// const Conversations = require('../../models/conversation');
		// let c = Conversations.find({customer_id:"1698352266916391"}).slice({messaging:[-4,10]}).cursor()
		// c.on(
		// 	'data',(res)=>{
		// 		console.log(res)
				
		// 	}
		// )
		

	} else {
		console.log(err);
	}
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;

