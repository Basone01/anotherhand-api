const router = require("express").Router();
const webhookController = require("../controllers/webhook.controller");

router
	.route("/")
	.get(webhookController.verifyWebhookAPI)
	.post(webhookController.handleFacebookMessage);

module.exports = router;
