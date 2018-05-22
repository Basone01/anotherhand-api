const config = require('../config');
const ConversationModel = require('../models/conversation');
const utils = require('../utils');
const mockupProductsArray = require('../utils/sampleProducts.json');
const ProductModel = require('../models/product');

function verifyWebhookAPI(req, res, next) {
	if (
		req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === config.FB_WEBHOOK_TOKEN
	) {
		console.log('Validating webhook');
		return res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error('Failed validation. Make sure the validation tokens match.');
		return res.sendStatus(403);
	}
}

async function handleFacebookMessage(req, res, next) {
	try {
		var FacebookMessages = req.body.entry;
		await storeConversation(FacebookMessages);
		await catchImageAttachment(FacebookMessages);
		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

const storeConversation = async (messageEntry) => {
	try {
		messageEntry.forEach(async (message) => {


			const { messaging, id, time, ...rest } = message;
			await utils.helper.asyncForEach(messaging, async (msg) => {
				await ConversationModel.update(
					{
						fb_conversation_id: id,
						shop_id: config.DEV_SHOP_ID
					},
					{
						$push: {
							messaging: msg
						},
						$set: {
							time,
							...rest,
							id
						}
					},
					{ upsert: true }
				);
			});
		});
	} catch (error) {
		throw error;
	}
};

async function catchImageAttachment(messageEntry) {
	try {

		messageEntry.forEach(async (messageObject) => {
			const { messaging, id } = messageObject;
			await utils.helper.asyncForEach(messaging, async (msg) => {
				//ignore page's and plain message
				if (!('message' in msg)) {
					return
				}
				if ('is_echo' in msg.message || 
					msg.message.attachments === undefined || 
					msg.message.attachments[0].type !== 'image') {
						return;
				}
				console.log("==================")
				console.log(msg.message)
				console.log("==================")
				//find all products
				const products = await ProductModel.find({});
				//tell the customer I'm finding
				await utils.facebookAPI.sendMessage(
					msg.sender.id,
					config.FB_PAGE_TOKEN,
					'หาแปปเอ่าะ...'
				);
				//attachment always come in array
				await utils.helper.asyncForEach(msg.message.attachments, async (attachment) => {
					//catch if it is image
					if (attachment.type === 'image') {
						console.log('I got an Image');

						/*
								Call an image search here
								findMatchedProduct accept image url and products from database to compare
								and will return object contain matchedProduct(object) and matchedImage(path)
								or return null if not found
								*/
						const product = await utils.image.findMatchedProduct(
							attachment.payload.url,
							products
						);
						if (!product) {
							console.log('Not Found this Product!');
							await utils.facebookAPI.sendMessage(
								msg.sender.id,
								config.FB_PAGE_TOKEN,
								'หาไม่เจอหงะ!!!'
							);
						} else {
							console.log('========================================');
							console.log(product);
							console.log('========================================');
							//response with the matched image
							await utils.facebookAPI.sendMessage(
								msg.sender.id,
								config.FB_PAGE_TOKEN,
								'เจอล๊าวววว!!!\nพิเลือกๆๆเลย...'
							);

							await utils.facebookAPI.sendMessage(
								msg.sender.id,
								config.FB_PAGE_TOKEN,
								product.matchedProduct.name
							);

							await utils.facebookAPI.sendImage(
								msg.sender.id,
								config.FB_PAGE_TOKEN,
								product.matchedImage
							);
							
							const remainingSize = `ตอนนี้เหลือไซส์\n` +
								product.matchedProduct.sizes
								.filter((item) => item.stock > 0)
								.map(item => `${item.size}${product.matchedProduct.size_type}`)
								.join(", ") 
								+ ` นิหื๊ออออ~` 
							await utils.facebookAPI.sendMessage(
								msg.sender.id,
								config.FB_PAGE_TOKEN,
								remainingSize
							);
							
						}
					}
				});
			});
		});
	} catch (error) {
		throw error
	 }
}

module.exports = {
	verifyWebhookAPI,
	handleFacebookMessage
};
