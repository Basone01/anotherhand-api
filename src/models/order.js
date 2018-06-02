const mongoose = require("mongoose");
const { Schema, SchemaTypes } = mongoose;

const orderSchema = new Schema({
	address: String,
	total_price: Number,
	order_id: String,
	customer_id: String,
	shop_id: String,
	product: { type: SchemaTypes.ObjectId, ref: "Product" },
	size: SchemaTypes.Mixed
});

module.exports = mongoose.model("Order", orderSchema);
