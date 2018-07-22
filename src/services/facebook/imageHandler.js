const FacebookAPI = require('./index');
const utils = require('../../utils/index');
const imageService = require('../image/index');
const ProductModel = require('../../models/product');
const ShopModel = require('../../models/shop');
const { getProductRemainingStockAnswer } = require('../../models/productHelperFunction');
const config = require('../../config/index');
async function catchImageAttachment(messageEntry, isAutoReply) {
	// console.log(isAutoReply)
	if (!isAutoReply) {
		return;
	}
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
				const shop = await ShopModel.findOne({ fb_page_id: shop_id });
				if (!shop) {
					throw new Error('Shop not found');
				}
				const token = shop.fb_page_token;

				//tell the customer I'm finding
				await FacebookAPI.sendMessage({
					targetUserID: customer_id,
					token: token,
					text: 'หาแปปเอ่าะ...'
				});
				// console.log('fsdgsfdgsdfgsdfg', productsFromDB);
				//attachment always come in array
				await utils.asyncForEach(msg.message.attachments, async (attachment, index, self) => {
					//catch if it is image
					if (attachment.type === 'image') {
						console.log('I got an Image');
						const screenshotImageUrl = attachment.payload.url;
						const screenshotImage = await imageService.downloadImageToBuffer(screenshotImageUrl);

						const { matchedProduct, matchedImage } = await imageService.findMatchedProduct(
							screenshotImage,
							productsFromDB
						);
						const answerPrefix =
							self.length > 1 ? `รูป${!index ? 'แรก' : `ที่ ${index + 1}`}:` : '';
						sendFindProductResult({
							customer_id,
							token: token,
							product: matchedProduct,
							answerPrefix
						});
					}
				});
			});
		});
	} catch (error) {
		throw error;
	}
}

const sendFindProductResult = async ({ customer_id, token, product, answerPrefix }) => {
	if (!product) {
		console.log('Not Found this Product!');
		await FacebookAPI.sendMessage({
			targetUserID: customer_id,
			token,
			text: `${answerPrefix}หาไม่เจอหงะ!!!`
		});
	}
	else {
		//response with the matched image
		await FacebookAPI.sendMessage({
			targetUserID: customer_id,
			token,
			text: `${answerPrefix}เจอล๊าวววว!!!`
		});

		let answer = getProductRemainingStockAnswer(product);

		await FacebookAPI.sendMessage({
			targetUserID: customer_id,
			token,
			text: answerPrefix + answer
		});
		console.log('FOUND AT', product);

		await FacebookAPI.sendProduct({ customer_id: customer_id, token, products: product });
	}
};

module.exports = catchImageAttachment;
