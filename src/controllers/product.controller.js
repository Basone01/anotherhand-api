const config = require('../config');
const { uploadImage } = require('../services/');
const ProductModel = require('../models/product');
const ShopModel = require('../models/shop');
const Types = require('mongoose').Types;

async function createProduct(req, res, next) {
	//bind shop id if in development
	let product = config.DEV_MODE
		? {
				...req.body,
				shop_id: config.DEV_SHOP_ID
			}
		: req.body;

	try {
		//shop must be exists
		const shop = await ShopModel.findOne({
			_id: product.shop_id
		});
		if (!shop) {
			throw new Error("Your shop doesn't exist");
		}

		product.images = await Promise.all(product.images.map(uploadImage));
		console.log(product);
		product._id = new Types.ObjectId();
		//finished preparing data, now add it to database
		const newProduct = await ProductModel.create(product);
		console.log(newProduct);
		//add refs to shop
		await ShopModel.update(
			{
				_id: newProduct.shop_id
			},
			{
				$push: {
					products: newProduct._id
				}
			}
		);
		//send the result back
		return res.json(newProduct);
	} catch (error) {
		console.log('OUTER', error);
		return next(error);
	}
}

async function getAllProducts(req, res, next) {
	const shop_detail = config.DEV_MODE
		? {
				shop_id: config.DEV_SHOP_ID
			}
		: {};
	try {
		const products = await ProductModel.find(shop_detail);
		return res.json(
			products.map((product) =>
				product.toObject({
					virtuals: true
				})
			)
		);
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
		return res.json(
			product.toJSON({
				virtuals: true
			})
		);
	} catch (error) {
		return next(error);
	}
}

async function deleteProduct(req, res, next) {
	const { _id } = req.body;
	if (!_id) next(new Error('no _id specified'));
	try {
		const deletingProduct = await ProductModel.findByIdAndRemove(_id);
		console.log(deletingProduct);
		return res.status(200).end();
	} catch (error) {
		next(error);
	}
}

async function updateProduct(req, res, next) {
	const { _id } = req.body;
	if (!_id) next(new Error('no _id specified'));
	try {
		let updatingProduct = req.body;
		console.log(updatingProduct);
		const oldImage = updatingProduct.images.filter((image) => !image.includes('data:'));
		const newImage = updatingProduct.images.filter((image) => image.includes('data:'));
		const uploaded_images = await Promise.all(newImage.map(uploadImage));
		updatingProduct.images = [
			...oldImage,
			...uploaded_images
		];
		let updatedProduct = await ProductModel.findByIdAndUpdate(_id, {
			$set: {
				...updatingProduct
			}
		});
		console.log(updatedProduct);
		return res.json({
			success: true,
			data: updatedProduct
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getProductById,
	getAllProducts,
	createProduct,
	deleteProduct,
	updateProduct
};
