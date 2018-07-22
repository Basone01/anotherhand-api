const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;

const shopModel = new Schema({
	name: {
		type: String
	},
	create_date: {
		type: Date,
		default: Date.now()
	},
	fb_page_id: {
		type: String,
		required: true,
		unique: true
	},
	fb_page_token: {
		type: String,
		required: true
	},
	autoReply: {
		type: Boolean,
		default: true
	}
	// ,
	// orders: [ { type: SchemaTypes.ObjectId, ref: 'Order' } ],
	// products: [ { type: SchemaTypes.ObjectId, ref: 'Product' } ]
});

module.exports = mongoose.model('Shop', shopModel);
