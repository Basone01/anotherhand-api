const config = require('../config');
const { helper } = require('../utils/');
const ProductModel = require('../models/product');
const ShopModel = require('../models/shop');
const Types = require('mongoose').Types;
const path = require('path');
const sharp = require('sharp');
const mkdirp = require('mkdirp');
const fs = require('fs');
const base64decoder = require('../utils/base64decoder');
//tell sharp don't lock the original file to make sure it can be delete
sharp.cache(true);

async function createProduct(req, res, next) {
	//bind shop id if in development
	let product = config.DEV_MODE
		? {
				...req.body,
				shop_id: config.DEV_SHOP_ID
			}
		: req.body;

	const { shop_id, product_id } = product;

	try {
		//shop must be exists
		const shop = await ShopModel.findOne({ _id: product.shop_id });
		if (!shop) {
			throw new Error("Your shop doesn't exist");
		}
		//create folder path
		product._id = new Types.ObjectId();
		const folder = path.join(__dirname, '..', `public/images/${shop_id}/${product._id}`);
		//create folder
		mkdirp(folder, async (err, created) => {
			if (err) {
				throw err;
			} else {
				product.images = await Promise.all(
					req.body.images.map(async (image, index) => {
						try {
							//resize and encode to jpeg and store in the folder that has created before
							const { data } = base64decoder(image);
							const filename = `${index}-${Date.now()}.jpg`;
							console.log(filename);
							await sharp(data).resize(1024, 1024).max().jpeg().toFile(path.join(folder, filename));
							// return file name to array
							return filename;
						} catch (error) {
							throw error;
						}
					})
				);
				//finished preparing data, now add it to database
				const newProduct = await ProductModel.create(product);
				//add refs to shop
				const shopResult = await ShopModel.update(
					{ _id: newProduct.shop_id },
					{
						$push: {
							products: newProduct._id
						}
					}
				);
				//send the result back
				return res.json(newProduct.toJSON({ virtuals: true }));
			}
		});
	} catch (error) {
		console.log('OUTER', error);
		return next(error);
	}
}

async function getAllProducts(req, res, next) {
	const shop_detail = config.DEV_MODE ? { shop_id: config.DEV_SHOP_ID } : {};
	try {
		const products = await ProductModel.find(shop_detail);
		return res.json(products.map((product) => product.toObject({ virtuals: true })));
	} catch (error) {
		return next(error);
	}
}

async function getProductById(req, res, next) {
	try {
		const product = await ProductModel.findById(req.params.id);
		if (!product) {
			throw new Error('not found');
		}
		return res.json(product.toJSON({ virtuals: true }));
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	getProductById,
	getAllProducts,
	createProduct
};
