const mongoose = require("mongoose");
const { Schema, SchemaTypes } = mongoose;

const conversationSchema = new Schema({
	customer_id: { type: String, unique: true },
	time: Number,
	shop_id: { type: String, ref: "Shop" },
	messaging: [
		{
			sender: { id: String },
			recipient: { id: String },
			timestamp: Number,
			message: [ SchemaTypes.Mixed ],
			postback: [ SchemaTypes.Mixed ]
		}
	]
});

module.exports = mongoose.model("Conversation", conversationSchema);
