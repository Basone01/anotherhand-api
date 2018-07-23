const config = require('../config');
const ProductModel = require('../models/product');
const OrderModel = require('../models/order');
const ShopModel = require('../models/shop');
const Types = require('mongoose').Types;
const path = require('path');
const { addCustomerProfileToOrder, sendMessage } = require('../services/facebook');
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
		const order = await OrderModel.findById(req.params.id).populate('product');
		const shop = await ShopModel.findById(config.DEV_SHOP_ID);

		if (!order) {
			throw new Error('not found');
		}
		const orderWithCustomerProfile = await addCustomerProfileToOrder(
			order.toObject(),
			shop.fb_page_token
		);
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
		res.json({
			success: true
		});
	} catch (error) {
		next(error);
	}
}

async function updateOrderStatus(req, res, next) {
	const { _id, currentStatus } = req.body;
	if (!_id) next(new Error('no _id specified'));
	let nextStatus;
	let message;
	switch (currentStatus) {
		case 'Placed':
			nextStatus = 'Pending';
			message = 'โอ้วว!! โอนแล้วหรอ รอพ่อค้ามารับยอดแปปนึงเด้ออ';
			break;
		case 'Pending':
			nextStatus = 'Paid';
			message = 'รับยอดโอนแล้วเด้อออ เดี๋ยวส่งให้นะครัชช';
			break;
		case 'Paid':
			nextStatus = 'Sent';
			message = 'ส่งของแล้วจ้า รอรับได้เลย';
			break;
		default:
			nextStatus = currentStatus;
			break;
	}
	try {
		const updatedProduct = await OrderModel.findOneAndUpdate(
			{ _id, status: currentStatus },
			{
				$set: {
					status: nextStatus
				}
			},
			{ new: true }
		);
		const shop = await ShopModel.findById(updatedProduct.shop);
		if (shop.autoReply) {
			await sendMessage({
				targetUserID: updatedProduct.customer_id,
				token: shop.fb_page_token,
				text: message
			});
		}

		return res.json({
			success: true,
			result: updatedProduct
		});
	} catch (error) {
		next(error);
	}
}

async function cancelOrder(req, res, next) {
	const { _id } = req.body;
	if (!_id) return next(new Error('no _id specified'));
	try {
		const updatedProduct = await OrderModel.findOneAndUpdate(
			{ _id },
			{
				$set: {
					status: 'Cancelled'
				}
			},
			{ new: true }
		);
		return res.json({
			success: true,
			result: updatedProduct
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getOrderById,
	getAllOrders,
	deleteOrder,
	createOrder,
	updateOrderStatus,
	cancelOrder
};
