const ConversationModel = require('../models/conversation');

async function getConversation(req, res, next) {
	const skip = Number(req.query.skip) || 0;
	try {
		const Conversation = await ConversationModel.find({}).slice(
			'messaging',
			-skip,
			6
		);
		return res.json(Conversation);
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	getConversation
};
