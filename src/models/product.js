const path = require('path');
const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;

const sizeSchema = new Schema({
	size: SchemaTypes.Mixed,
	price: { type: Number, default: 0 },
	stock: { type: Number, default: 0 },
	sold: { type: Number, default: 0 }
});

const productSchema = new Schema({
	shop_id: { required: true, type: SchemaTypes.ObjectId },
	product_id: { type: String, uppercase: true },
	name: String,
	price: { type: Number, default: 0 },
	description: String,
	images: {
		type: [
			String
		],
		required: true
	},
	has_size: { type: Boolean, default: false },
	date_created: { type: Date, default: Date.now() },
	sizes: {
		size_type: String,
		size_list: {
			type: Array,
			default: null
		}
	}
});


productSchema.virtual("images_full_path").get(function(){
	return this.images.map(image => path.join(__dirname, `../public/images/${this.shop_id}/${this._id}/${image}`))
})

module.exports = mongoose.model('Product', productSchema);
