const mongoose = require("mongoose");
const { Schema, SchemaTypes } = mongoose;

const shopModel = new Schema({
	name: {
		type: String
	},
	id: {
		type: String,
		required: true
	},
	createDate: {
		type: Date,
		default: Date.now()
	},
	fbPageId: {
		type: String,
		required: true,
		unique:true
	},
	orders: [ { type: SchemaTypes.ObjectId, ref: "Order" } ],
	products: [ { type: SchemaTypes.ObjectId, ref: "Product" } ]
});

module.exports = mongoose.model("Shop", shopModel);
