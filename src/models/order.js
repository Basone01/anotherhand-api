const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;

const orderSchema = new Schema({
	address: String,
	total_price: Number,
	customer_id: String,
	shop: { type: SchemaTypes.ObjectId, ref: 'Shop' },
	product: { type: SchemaTypes.ObjectId, ref: 'Product' },
	size: SchemaTypes.Mixed,
	date: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Order', orderSchema);
