const ConversationModel = require('../../models/conversation');
const utils = require('../../utils/index');
const config = require('../../config/index');
const storeConversation = async (messageEntry, socketIO) => {
	try {
		messageEntry.forEach(async (message) => {
			const { messaging, id, time, ...rest } = message;
			await utils.asyncForEach(messaging, async (msg) => {
				const customer_id =
					id === msg.sender.id ? msg.recipient.id : msg.sender.id;
				await ConversationModel.update(
					{
						customer_id: customer_id,
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
				// console.log(messaging)
				socketIO.sockets.to(id).emit('msg', {
					...message,
					customer_id
				});
				console.log('customer:', customer_id);
			});
		});
	} catch (error) {
		throw error;
	}
};

module.exports = storeConversation;
