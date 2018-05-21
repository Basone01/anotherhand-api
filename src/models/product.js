const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;

const sizeSchema = new Schema({
	size  : SchemaTypes.Mixed,
	price : { type: Number, default: 0 },
	stock : { type: Number, default: 0 },
	sold  : { type: Number, default: 0 }
});

const productSchema = new Schema({
	shop_Id     : { required: true, type: SchemaTypes.ObjectId },
	productId   : { type: String, uppercase: true },
	name        : String,
	price       : { type: Number, default: 0 },
	description : String,
	images      : {
		type: [
			String
		],
		required: true
	},
	hasSize     : { type: Boolean, default: false },
	dateCreated : { type: Date, default: Date.now() },
	sizes       : {
		sizeType : String,
		sizeList : {
			type    : Array,
			default : null
		}
	}
});

module.exports = mongoose.model('Product', productSchema);
