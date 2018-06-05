const path = require("path");
const mongoose = require("mongoose");
const { Schema, SchemaTypes } = mongoose;
const mkdirp = require("mkdirp");
const base64toBuffer = require("../utils/base64decoder");
const sharp = require("sharp");
const sizeSchema = new Schema({
  size: SchemaTypes.Mixed,
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 }
});

const productSchema = new Schema({
  shop_id: { required: true, type: SchemaTypes.ObjectId },
  name: String,
  price: { type: Number, default: 0 },
  description: String,
  stock: { type: Number, default: 0 },
  images: {
    type: [String],
    required: true
  },
  size_type: { type: String, default: "" },
  date_created: { type: Date, default: Date.now() },
  sizes: [sizeSchema],
  tags: [String]
});

module.exports = mongoose.model("Product", productSchema);
