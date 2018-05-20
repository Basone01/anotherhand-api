const ShopModel = require('../models/shop');

async function createShop (req, res, next) {
	try {
		const newShop = await ShopModel.create(req.body);
		return res.json(newShop);
	} catch (error) {
		return next(error);
	}
}

async function getShop (req, res, next) {
	try {
		const myShop = await ShopModel.findOne({}).populate('products');
		return res.json(myShop);
	} catch (error) {
		return next(error);
	}
}

async function deleteShop (req, res, next) {
	const { _id } = req.params;
	try {
		if (!_id) {
			throw new Error('id is required');
		}
		const result = await ShopModel.deleteOne({ _id });
		return res.status(204).json({
			success : true,
			result
		});
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createShop,
	getShop,
	deleteShop
};
