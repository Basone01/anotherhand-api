const ConversationModel = require('../models/conversation');
const ProductModel = require('../models/product');
const {
	getCustomerProfileFromPSID,
	sendMessage,
	sendProduct
} = require('../services/facebook/index');

async function getConversation(req, res, next) {
	const skip = Number(req.query.skip) || 20;
	const { fb_page_id, fb_page_token } = req.body;
	try {
		const Conversation = await ConversationModel.find({
			shop_fb_id: fb_page_id
		}).slice('messaging', -skip, 20);
		const response = await Promise.all(
			Conversation.map(async (con) => {
				const customerData = await getCustomerProfileFromPSID({
					id: con.customer_id,
					token: fb_page_token
				});
				return {
					...con.toObject(),
					...customerData
				};
			})
		);
		return res.json(response);
	} catch (error) {
		return next(error);
	}
}

async function getConversationProfile(req, res, next) {
	const { fb_page_id, fb_page_token, customer_id } = req.body;
	console.log('\n\n\n' + JSON.stringify(req.body, null, 3) + '\n\n\n');
	try {
		const customerData = await getCustomerProfileFromPSID({
			id: customer_id,
			token: fb_page_token
		});
		return res.json({ customer_id, ...customerData });
	} catch (error) {
		return next(error);
	}
}

async function sendMessageToFacebook(req, res, next) {
	const { customer_id, fb_page_token, message } = req.body;
	try {
		const result = await sendMessage({
			targetUserID: customer_id,
			token: fb_page_token,
			text: message
		});
		return res.json(result);
	} catch (error) {
		next(error);
	}
}

async function sendProductToCustomer(req, res, next) {
	const { customer_id, fb_page_token, products: productId } = req.body;
	console.log(req.body);
	try {
		const products = await ProductModel.find({
			_id: {
				$in: productId.length
					? productId
					: [
							productId
						]
			}
		});
		console.log(products)
		if (!products) {
			throw new Error('Products not found');
		}
		const result = await sendProduct({
			customer_id: customer_id,
			token: fb_page_token,
			products: products
		});
		return res.json({ success: true, result });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	getConversation,
	getConversationProfile,
	sendMessageToFacebook,
	sendProductToCustomer
};
