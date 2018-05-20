const ConversationModel = require('../models/conversation');
const config = require('../config');

function verifyWebhookAPI (req, res, next) {
	if (
		req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === config.FB_WEBHOOK_TOKEN
	) {
		console.log('Validating webhook');
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error('Failed validation. Make sure the validation tokens match.');
		res.sendStatus(403);
	}
}

function handleFacebookMessage (req, res, next) {
	try {
		var FasebookMessages = req.body.entry;
		FasebookMessages.forEach(async (message) => {
			console.log('==================================');
			console.log(JSON.stringify(message, null, 3));
			console.log('==================================');
			const { messaging, id, ...rest } = message;
			messaging.forEach(async (msg) => {
				await ConversationModel.update(
					{
						fb_conversation_id : id,
						shop_id            : config.DEV_SHOP_ID
					},
					{
						fb_conversation_id : id,
						$push              : {
							messaging : msg,
							...rest
						}
					},
					{ upsert: true }
				);
			});
		});

		res.sendStatus(200);
	} catch (error) {
		next(error);
	}
}

module.exports = {
	verifyWebhookAPI,
	handleFacebookMessage
};
