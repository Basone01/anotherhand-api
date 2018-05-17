const ShopModel = require("../models/shop");

async function createShop(req, res, next) {
	try {
		const newShop = await ShopModel.create(req.body);
		res.json(newShop);
	} catch (error) {
		console.log(error.message);
		res.status(500).send(error.message);
	}
}

async function getMyShop(req, res, next) {
	try {
		const myShop = await ShopModel.findOne({}).populate("products");
		res.json(myShop);
	} catch (error) {
		console.log(error.message);
		res.status(500).end(error.message);
	}
}

module.exports = {
	createShop,
	getMyShop
};
