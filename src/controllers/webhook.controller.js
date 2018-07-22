const config = require('../config');
const ShopModel = require('../models/shop');
const catchPostback = require('../services/facebook/postbackHandler');
const catchImageAttachment = require('../services/facebook/imageHandler');
const storeConversation = require('../services/facebook/storeConversation');
function verifyWebhookAPI(req, res, next) {
	if (
		req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === config.FB_WEBHOOK_TOKEN
	) {
		console.log('Validating webhook');
		return res.status(200).send(req.query['hub.challenge']);
	}
	else {
		console.error('Failed validation. Make sure the validation tokens match.');
		return res.sendStatus(403);
	}
}

async function handleFacebookMessage(req, res, next) {
	const socketIO = req.socketIO;
	try {
		var FacebookMessages = req.body.entry.filter((msgEntry) => 'messaging' in msgEntry);
		const Shop = await ShopModel.findOne(
			{ fb_page_id: FacebookMessages[0].id },
			'autoReply'
		);
		// console.log(Shop.autoReply)
		// console.log(JSON.stringify(FacebookMessages, null, 3));
		console.log('i got a message');
		storeConversation(FacebookMessages, socketIO);
		catchImageAttachment(FacebookMessages, Shop.autoReply);
		catchPostback(FacebookMessages, Shop.autoReply);
		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

//end of route function

module.exports = {
	verifyWebhookAPI,
	handleFacebookMessage
};
