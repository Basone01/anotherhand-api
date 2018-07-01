const FacebookAPI = require('./index');
const utils = require('../../utils/index');
const imageService = require('../image/index');
const ProductModel = require('../../models/product');
const { getProductRemainingStockAnswer } = require('../../models/productHelperFunction');
const config = require('../../config/index');
async function catchImageAttachment(messageEntry) {
	try {
		messageEntry.forEach(async (messageObject) => {
			const { messaging, id: shop_id } = messageObject;
			//filter and get only customer messages
			const customerMessages = messaging.filter((msg) => msg.sender.id !== shop_id);
			//masages always come in array form
			await utils.asyncForEach(customerMessages, async (msg) => {
				const customer_id = msg.sender.id;
				//ignore page's and plain message
				if (!('message' in msg)) {
					console.log('=========NO MSG=========');
					//   console.log(JSON.stringify(msg, null, 3));
					//   console.log("==================");
					return;
				}
				if (!('attachments' in msg.message)) {
					console.log('=========NO ATTACHMENTS=========');
					// console.log(JSON.stringify(msg, null, 3));
					// console.log("==================");
					return;
				}
				if ('sticker_id' in msg.message) {
					console.log('=========THIS IS A STICKER=========');
					// console.log(JSON.stringify(msg, null, 3));
					// console.log("==================");
					return;
				}
				//find all products
				const productsFromDB = await ProductModel.find({});
				//tell the customer I'm finding
				await FacebookAPI.sendMessage(customer_id, config.FB_PAGE_TOKEN, 'หาแปปเอ่าะ...');
				// console.log('fsdgsfdgsdfgsdfg', productsFromDB);
				//attachment always come in array
				await utils.asyncForEach(msg.message.attachments, async (attachment, index, self) => {
					//catch if it is image
					if (attachment.type === 'image') {
						console.log('I got an Image');
						const screenshotImageUrl = attachment.payload.url;
						const screenshotImage = await imageService.downloadImageToBuffer(screenshotImageUrl);
						/*
							Call an image search here
							findMatchedProduct accept image url and products from database to compare
							and will return object contain matchedProduct(object) and matchedImage(path)
							or return null if not found
						*/
						findProductFromImageAndAnswerToCustomer({
							screenshotImage:screenshotImage,
							productsFromDB:productsFromDB,
							customerFbId: customer_id,
							index:index,
							length: self.length
						});
					}
				});
			});
		});
	} catch (error) {
		throw error;
	}
}

//start finding product from image
const findProductFromImageAndAnswerToCustomer = async ({
	screenshotImage,
	productsFromDB,
	customerFbId,
	index,
	length
}) => {
	const matchedResult = await imageService.findMatchedProduct(screenshotImage, productsFromDB);
	const answerPrefix = length > 1 ? `รูป${!index ? 'แรก' : `ที่ ${index + 1}`}:` : '';
	if (!matchedResult) {
		console.log('Not Found this Product!');
		await FacebookAPI.sendMessage(customerFbId, config.FB_PAGE_TOKEN, `${answerPrefix}หาไม่เจอหงะ!!!`);
	}
	else {
		const { matchedProduct, matchedImage } = matchedResult;
		//response with the matched image
		await FacebookAPI.sendMessage(customerFbId, config.FB_PAGE_TOKEN, `${answerPrefix}เจอล๊าวววว!!!`);

		let answer = getProductRemainingStockAnswer(matchedProduct);

		await FacebookAPI.sendMessage(customerFbId, config.FB_PAGE_TOKEN, answerPrefix + answer);
		console.log('FOUND AT', matchedProduct);

		await FacebookAPI.sendProduct(customerFbId, config.FB_PAGE_TOKEN, matchedProduct);
	}
};

module.exports = catchImageAttachment;
