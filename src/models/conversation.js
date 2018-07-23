const mongoose = require("mongoose");
const {Schema, SchemaTypes} = mongoose;

const conversationSchema = new Schema({
	customer_id: {
		type: String,
		unique: true
	},
	time: Number,
	shop: {
		type: SchemaTypes.ObjectId,
		ref: "Shop"
	},
	shop_fb_id:String,
	messaging: [
		{
			sender: {
				id: String
			},
			recipient: {
				id: String
			},
			timestamp: Number,
			message: SchemaTypes.Mixed,
			postback: SchemaTypes.Mixed
		}
	],
	last_modified: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("Conversation", conversationSchema);
