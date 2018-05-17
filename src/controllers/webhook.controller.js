const ConversationModel = require("../models/conversation");
const config = require("../config");

function verifyWebhookAPI(req, res) {
	if (
		req.query["hub.mode"] === "subscribe" &&
		req.query["hub.verify_token"] === config.FB_WEBHOOK_TOKEN
	) {
		console.log("Validating webhook");
		res.status(200).send(req.query["hub.challenge"]);
	} else {
		console.error(
			"Failed validation. Make sure the validation tokens match."
		);
		res.sendStatus(403);
	}
}

function handleFacebookMessage(req, res) {
	console.log("==================================");
	console.log("recieved a message");
	console.log("==================================");

	var FasebookMessages = req.body.entry;
	FasebookMessages.forEach((message) => {
		const { id } = message;
		console.log("==================================");
		console.log(JSON.stringify(message, null, 3));
		console.log("==================================");
		const { messaging, ...rest } = message;

		message.messaging.forEach((msg) => {
			ConversationModel.update(
				{
					fb_conversation_id: id,
					shop_id:"0001"
				},
				{
					fb_conversation_id: id,
					...rest,
					$push: {
						messaging: msg
					}
				},
				{ upsert: true }
			)
				.then((res) => console.log(res.result))
				.catch((err) => console.log(err));
		});
	});

	res.sendStatus(200);
}

module.exports = {
	verifyWebhookAPI,
	handleFacebookMessage
};
