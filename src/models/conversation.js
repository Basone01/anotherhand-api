const mongoose = require("mongoose");
const { Schema, SchemaTypes } = mongoose;

const conversationSchema = new Schema({
	fb_conversation_id: { type: String, unique: true },
	time: Number,
	shop_id: { type: String, ref: "Shop" },
	fb_page_id: Number,
	messaging: [
		{
			sender: { id: String },
			recipient: { id: String },
			timestamp: Number,
			message: [ SchemaTypes.Mixed ]
		}
	]
});

module.exports = mongoose.model("Conversation", conversationSchema);
