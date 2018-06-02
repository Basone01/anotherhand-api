const config = require('../config');
const ProductModel = require('../models/product');
const OrderModel = require('../models/order');
const ShopModel = require('../models/shop');
const Types = require('mongoose').Types;
const path = require('path');
const { getCustomerProfileFromPSID } = require('../services/facebook');
async function createOrder(req, res, next) {
	try {
		const newOrder = await OrderModel.create(req.body);
		return res.json(newOrder);
	} catch (error) {
		return next(error);
	}
}

async function getAllOrders(req, res, next) {
	const shop_detail = config.DEV_MODE
		? {
				shop: config.DEV_SHOP_ID
			}
		: {};
	try {
		const orders = await OrderModel.find(shop_detail).populate('product');
		const shop = await ShopModel.findById(config.DEV_SHOP_ID);
		const ordersWithCustomerProfile = await Promise.all(
			orders.map((order) => addCustomerProfileToOrder(order.toObject(), shop.fb_page_token))
		);
		return res.json(ordersWithCustomerProfile);
	} catch (error) {
		return next(error);
	}
}

async function getOrderById(req, res, next) {
	try {
		const order = await OrderModel.findById(req.params.id);
		const shop = await ShopModel.findById(config.DEV_SHOP_ID);

		if (!order) {
			throw new Error('not found');
		}
		const orderWithCustomerProfile = await addCustomerProfileToOrder(order.toObject(), shop.fb_page_token);
		return res.json(orderWithCustomerProfile);
	} catch (error) {
		return next(error);
	}
}

async function deleteOrder(req, res, next) {
	const { _id } = req.body;
	if (!_id) next(new Error('no _id specified'));
	try {
		const deletingProduct = await OrderModel.findByIdAndRemove(_id);
		console.log(deletingOrder);
		rimraf(path.join(__dirname, `../public/images/${deletingOrder.shop_id}/${deletingOrder._id}`), (err) => {
			if (err) {
				console.log(err);
				throw err;
			}
			res.json({
				success: true
			});
		});
	} catch (error) {
		next(error);
	}
}

const addCustomerProfileToOrder = (order, token) => {
	const orderWithCustomerDetails = new Promise(async (resolve, reject) => {
		try {
			const customer_profile = await getCustomerProfileFromPSID(order.customer_id, token);
			const orderWithCustomerProfile = { ...order, customer_profile };
			resolve(orderWithCustomerProfile);
		} catch (error) {
			reject(error);
		}
	});

	return orderWithCustomerDetails;
};

module.exports = {
	getOrderById,
	getAllOrders,
	deleteOrder,
	createOrder
};
