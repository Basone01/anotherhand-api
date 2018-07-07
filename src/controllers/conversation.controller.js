const ConversationModel = require('../models/conversation');
const { getCustomerProfileFromPSID } = require('../services/facebook/index');

async function getConversation(req, res, next) {
	const skip = Number(req.query.skip) || 6;
	const { fb_page_id, fb_page_token } = req.body;
	try {
		const Conversation = await ConversationModel.find({
			shop_fb_id: fb_page_id
		}).slice('messaging', -skip, 6);
		const response = await Promise.all(
			Conversation.map(async (con) => {
				const customerData = await getCustomerProfileFromPSID(
					con.customer_id,
					fb_page_token
				);

				return {
					...con.toObject(),
					...customerData
				};
			})
		);
		console.log(response);
		return res.json(response);
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	getConversation
};
