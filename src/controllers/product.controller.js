const config = require("../config");
const ProductModel = require("../models/product");
const ShopModel = require("../models/shop");
const Types = require("mongoose").Types;
const path = require("path");
const sharp = require("sharp");
const mkdirp = require("mkdirp");
const fs = require("fs");
sharp.cache(false);
async function createProduct(req, res, next) {
	let product = config.DEV_MODE
		? {
				...req.body,
				shop_Id: config.DEV_SHOP_ID
			}
		: req.body;
	const { shop_Id, productId } = product;
	console.log(product);
	
	try {
		const shop = await ShopModel.findOne({ _id: product.shop_Id });
		if (!shop) {
			throw new Error("Your shop doesn't exist");
		}
		const folder = `public/images/${shop_Id}/${productId}`;
		mkdirp(path.join(__dirname, "..", folder), (err, created) => {
			console.log(created);
		});
		product.images = await Promise.all(
			req.files.map(async (file) => {
				console.log(file);

				try {
					await sharp(file.path)
						.resize(1024, 1024)
						.max()
						.jpeg()
						.toFile(
							path.join(
								__dirname,
								"..",
								folder,
								file.filename + ".jpg"
							)
						);
					fs.unlink(file.path, (err) => {
						console.log(err);
					});
					return folder + "/" + file.filename + ".jpg";
				} catch (error) {
					console.log(error.message);
				}
			})
		);
		console.log(product.images);
		const newProduct = await ProductModel.create(product);
		const shopResult = await ShopModel.update(
			{ _id: newProduct.shop_Id },
			{
				$push: {
					products: newProduct._id
				}
			}
		);
		res.json(newProduct);
	} catch (error) {
		console.log(error.message);
		res.status(500).end(error.message);
	}
}

async function getAllProducts(req, res, next) {
	const shop_detail = config.DEV_MODE ? { shop_Id: config.DEV_SHOP_ID } : {};
	try {
		const products = await ProductModel.find(shop_detail);
		res.json(products);
	} catch (error) {
		console.log(error.message);
		res.status(500).end(error.message);
	}
}

async function getProductById(req, res, next) {
	const detail = config.DEV_MODE
		? { shop_Id: config.DEV_SHOP_ID, _id: req.params.id }
		: { _id: req.params.id };

	try {
		const product = await ProductModel.find(detail);
		res.json(product);
	} catch (error) {
		console.log(error.message);
		res.status(500).end(error.message);
	}
}

module.exports = {
	getProductById,
	getAllProducts,
	createProduct
};
