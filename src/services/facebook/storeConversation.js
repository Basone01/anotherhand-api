const ConversationModel = require('../../models/conversation');
const utils = require('../../utils/index');
const config = require('../../config/index');
const storeConversation = async (messageEntry, socketIO) => {
	try {
		messageEntry.forEach(async (message) => {
			const { messaging, id, time, ...rest } = message;
			await utils.asyncForEach(messaging, async (msg) => {
				const newMessage = await ConversationModel.update(
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
				console.log(newMessage);
				socketIO.sockets.to(id).emit("msg", message);
				console.log('customer:', id === msg.sender.id ? id : msg.sender.id);
			});
		});
	} catch (error) {
		throw error;
	}
};

module.exports = storeConversation;
