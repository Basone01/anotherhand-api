const mongoose = require("mongoose");
const { Schema, SchemaTypes } = mongoose;

const sizeSchema = new Schema({
	size: SchemaTypes.Mixed,
	price: { type: Number, default: 0 },
	stock: { type: Number, default: 0 },
	sold: { type: Number, default: 0 }
});

const productSchema = new Schema({
	shop_Id: { required: true, type: SchemaTypes.ObjectId },
	productId: { type: String, uppercase: true },
	name: String,
	defaultPrice: { type: Number, default: 0 },
	model: String,
	brand: String,
	description: String,
	modelId: { type: String, uppercase: true },
	images: { type: [ String ], required: true },
	hasSize: { type: Boolean, default: false },
	sizes: {
		sizeType: String,
		sizeList: {
			type: Array,
			default: null
		}
	}
});

module.exports = mongoose.model("Product", productSchema);
