const ShopModel = require('../models/shop');
const { getPageProfileFromPSID } = require('../services/facebook/index');
async function createShop(req, res, next) {
	try {
		const newShop = await ShopModel.create(req.body);
		return res.json(newShop);
	} catch (error) {
		return next(error);
	}
}

async function getShop(req, res, next) {
	try {
		const myShop = await ShopModel.findOne({ _id: req.params.id });
		const pageInfo = await getPageProfileFromPSID({
			id: myShop.fb_page_id,
			token: myShop.fb_page_token
		});
		return res.json({ ...myShop.toObject(), ...pageInfo, picture: pageInfo.picture.data.url });
	} catch (error) {
		console.log(error.message);
		return next(error);
	}
}

async function deleteShop(req, res, next) {
	const { _id } = req.params;
	try {
		if (!_id) {
			throw new Error('id is required');
		}
		const result = await ShopModel.deleteOne({ _id });
		return res.status(200).json({
			success: true,
			result
		});
	} catch (error) {
		return next(error);
	}
}

async function toggleAutoReply(req, res, next) {
	const { _id } = req.body;
	try {
		if (!_id) {
			throw new Error('id is required');
		}
		const shop = await ShopModel.findOne({ _id });
		const result = await ShopModel.updateOne(
			{ _id },
			{
				autoReply: !shop.autoReply
			}
		);
		return res.status(200).json({
			success: true,
			autoReply:!shop.autoReply
		});
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createShop,
	getShop,
	deleteShop,
	toggleAutoReply
};
