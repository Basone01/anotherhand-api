const mongoose = require("mongoose");
const { Schema, SchemaTypes } = mongoose;

const orderSchema = new Schema({
	address: String,
	totalPrice: Number,
	orderId: String,
	customerId: String,
	shopId: String,
	product: { type: SchemaTypes.ObjectId, ref: "Product" },
	size: SchemaTypes.Mixed
});

module.exports = mongoose.model("Order", orderSchema);
