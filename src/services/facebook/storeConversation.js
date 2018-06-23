const ConversationModel = require('../../models/conversation');
const utils = require('../../utils/index');
const config = require('../../config/index');
const storeConversation = async (messageEntry) => {
	try {
		messageEntry.forEach(async (message) => {
			const { messaging, id, time, ...rest } = message;
			await utils.asyncForEach(messaging, async (msg) => {
				console.log(id === msg.sender.id);
				await ConversationModel.update(
					{
						shop: config.DEV_SHOP_ID,
						customer_id: id === msg.sender.id ? msg.recipient.id : msg.sender.id,
						shop_fb_id: id
					},
					{
						$push: {
							messaging: msg
						},
						$set: {
							time,
							...rest,
							shop_fb_id: id
						}
					},
					{ upsert: true }
				);
				console.log('customer:', id === msg.sender.id ? id : msg.sender.id);
			});
		});
	} catch (error) {
		throw error;
	}
};

module.exports = storeConversation;