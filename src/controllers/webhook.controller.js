const config = require('../config');
const ConversationModel = require('../models/conversation');
const utils = require('../utils');
const services = require('../services');
const mockupProductsArray = require('../utils/sampleProducts.json');
const ProductModel = require('../models/product');
const OrderModel = require('../models/order');
const ShopModel = require('../models/shop');
function verifyWebhookAPI(req, res, next) {
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_WEBHOOK_TOKEN) {
		console.log('Validating webhook');
		return res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error('Failed validation. Make sure the validation tokens match.');
		return res.sendStatus(403);
	}
}

async function handleFacebookMessage(req, res, next) {
	try {
		var FacebookMessages = req.body.entry.filter((msgEntry) => 'messaging' in msgEntry);
		console.log(JSON.stringify(FacebookMessages, null, 3));
		// await storeConversation(FacebookMessages);
		await catchImageAttachment(FacebookMessages);
		await catchPostback(FacebookMessages);
		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

//end of route function

const storeConversation = async (messageEntry) => {
	try {
		messageEntry.forEach(async (message) => {
			const { messaging, id, time, ...rest } = message;
			await utils.asyncForEach(messaging, async (msg) => {
				await ConversationModel.update(
					{
						shop_id: config.DEV_SHOP_ID,
						customer_id: id === msg.sender.id ? id : msg.sender.id
					},
					{
						$push: {
							messaging: msg
						},
						$set: {
							time,
							...rest,
							id
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

const catchPostback = async (messageEntry) => {
	try {
		messageEntry.forEach(async (message) => {
			const { messaging, id, time, ...rest } = message;
			await utils.asyncForEach(messaging, async (msg) => {
				try {
					if ('postback' in msg) {
						const command = JSON.parse(msg.postback.payload);
						switch (command.req) {
							case 'getDetails':
								console.log('GET D');
								await handleMoreDetails(msg.sender.id, id, command._id);
								break;

							case 'getImages':
								console.log('IMAGE');
								await handleMoreImage(msg.sender.id, id, command._id);
								break;
							case 'placeOrder':
								console.log('ORDER');
								const order = await handlePlaceOrder(msg.sender.id, id, command._id);

								break;
							default:
								break;
						}
					}
				} catch (error) {
					throw error;
				}
			});
		});
	} catch (error) {
		throw error;
	}
};

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

				//find all products
				const productsFromDB = await ProductModel.find({});
				//tell the customer I'm finding
				await services.FacebookAPI.sendMessage(customer_id, config.FB_PAGE_TOKEN, 'หาแปปเอ่าะ...');
				console.log('fsdgsfdgsdfgsdfg', productsFromDB);
				//attachment always come in array
				await utils.asyncForEach(msg.message.attachments, async (attachment, index, self) => {
					//catch if it is image
					if (attachment.type === 'image') {
						console.log('I got an Image');
						const screenshotImageUrl = attachment.payload.url;
						const screenshotImage = await services.imageService.downloadImageToBuffer(
							attachment.payload.url
						);
						/*
							Call an image search here
							findMatchedProduct accept image url and products from database to compare
							and will return object contain matchedProduct(object) and matchedImage(path)
							or return null if not found
						*/
						findProductFromImageAndAnswerToCustomer(
							screenshotImage,
							productsFromDB,
							customer_id,
							index,
							self.length
						);
					}
				});
			});
		});
	} catch (error) {
		throw error;
	}
}

module.exports = {
	verifyWebhookAPI,
	handleFacebookMessage
};

// when user place order

const handlePlaceOrder = async (customer_fb_id, shop_id, product_id) => {
	try {
		const product = await ProductModel.findById(product_id);
		console.log(product);
		if (!product) {
			throw new Error('Product Not Found');
		} else {
			if (product.sizes.length < 1) {
				if (product.stock < 1) {
					return await services.FacebookAPI.sendMessage(
						customer_fb_id,
						config.FB_PAGE_TOKEN,
						'ก็บอกว่าของหมดไงฟร้ะะ!! \nฟังม่ายรุเรื่องอ๋อออ~!!!'
					);
				}
			} else {
				const total_stock = product.sizes.reduce((stock, size) => stock + size.stock, 0);
				if (total_stock < 1) {
					return await services.FacebookAPI.sendMessage(
						customer_fb_id,
						config.FB_PAGE_TOKEN,
						'ก็บอกว่าของหมดไงฟร้ะะ!! \nฟังม่ายรุเรื่องอ๋ออ~!!!'
					);
				}
			}

			const shop = await ShopModel.findOne({fb_page_id:shop_id})
			const order = new OrderModel({
				product: product_id,
				customer_id: customer_fb_id,
				shop:shop._id,
				total_price: product.price
			});
			console.log(order);
			const savedOrder = await order.save();
			if (!savedOrder) {
				throw new Error('Error When Creating Order');
			} else {
				await services.FacebookAPI.sendMessage(customer_fb_id, config.FB_PAGE_TOKEN, 'โอเคค๊าบบบ');
				await services.FacebookAPI.sendMessage(
					customer_fb_id,
					config.FB_PAGE_TOKEN,
					`${product.name} นะ
          `
				);
				await services.FacebookAPI.sendMessage(
					customer_fb_id,
					config.FB_PAGE_TOKEN,
					`ทั้งหมด ${product.price} บาทจ้า`
				);
				await services.FacebookAPI.sendMessage(
					customer_fb_id,
					config.FB_PAGE_TOKEN,
					`เลขบัญชีมะบอกหรอก!~\nแต่ชำระเงินแล้วอย่าลืม\nส่งที่ชื่ออยู่ เบอร์โทรให้น้องบอทด้วยเน้อออ~`
				);
				return true;
			}
		}
	} catch (error) {
		throw error;
	}
};

const handleMoreImage = async (customer_fb_id, shop_id, product_id) => {
	try {
		let product = await ProductModel.findById(product_id);
		product = product.toJSON({ virtuals: true });
		if (!product) {
			throw new Error('Product Not Found');
		} else {
			product.images.forEach(async (image) => {
				try {
					await services.FacebookAPI.sendImage(customer_fb_id, config.FB_PAGE_TOKEN, image);
				} catch (error) {
					throw error;
				}
			});

			return true;
		}
	} catch (error) {
		throw error;
	}
};

const handleMoreDetails = async (customer_fb_id, shop_id, product_id) => {
	try {
		let product = await ProductModel.findById(product_id);
		product = product.toJSON({ virtuals: true });
		console.log(product);
		if (!product) {
			throw new Error('Product Not Found');
		} else {
			try {
				let price = null;
				if (product.sizes.length > 0) {
					const sizes_price = product.sizes.map((size) => size.price);
					price =
						Math.min(...sizes_price) < Math.max(...sizes_price)
							? `${Math.min(...sizes_price)}-${Math.max(...sizes_price)}`
							: Math.max(...sizes_price);
				} else {
					price = product.price;
				}

				await services.FacebookAPI.sendMessage(
					customer_fb_id,
					config.FB_PAGE_TOKEN,
					`สินค้า: ${product.name}\nราคา: ${price} บาท\nรายละเอียด: ${product.description}`
				);

				await services.FacebookAPI.sendMessage(
					customer_fb_id,
					config.FB_PAGE_TOKEN,
					getRemainingStockAnswerFromMatchedProduct(product)
				);

				return true;
			} catch (error) {
				throw error;
			}
		}
	} catch (error) {
		throw error;
	}
};

//start finding product from image
const findProductFromImageAndAnswerToCustomer = async (
	screenshotImage,
	productsFromDB,
	customerFbId,
	index,
	length
) => {
	const matchedResult = await services.imageService.findMatchedProduct(screenshotImage, productsFromDB);
	const answerPrefix = length > 1 ? `รูป${!index ? 'แรก' : `ที่ ${index + 1}`}:` : '';
	if (!matchedResult) {
		console.log('Not Found this Product!');
		await services.FacebookAPI.sendMessage(customerFbId, config.FB_PAGE_TOKEN, `${answerPrefix}หาไม่เจอหงะ!!!`);
	} else {
		const { matchedProduct, matchedImage } = matchedResult;
		//response with the matched image
		await services.FacebookAPI.sendMessage(customerFbId, config.FB_PAGE_TOKEN, `${answerPrefix}เจอล๊าวววว!!!`);

		let answer = getRemainingStockAnswerFromMatchedProduct(matchedProduct);

		await services.FacebookAPI.sendMessage(customerFbId, config.FB_PAGE_TOKEN, answerPrefix + answer);
		console.log(matchedProduct);

		await services.FacebookAPI.sendProduct(customerFbId, config.FB_PAGE_TOKEN, matchedProduct);
	}
};

//Get Answer about remaining stock
const getCountFromSizeArray = (sizeArray) => {
	return sizeArray.reduce((count, size) => {
		return count + size.stock;
	}, 0);
};
const getSizeListStringFromSizes = (sizes, size_type) => {
	return sizes.filter((size) => size.stock > 0).map((size) => `${size.size}${size_type}`).join(', ');
};

const getRemainingStockAnswerFromMatchedProduct = (matchedProduct) => {
	const { sizes, size_type, stock } = matchedProduct;
	let answer = '';

	if (sizes.length > 0) {
		const allSizeStock = getCountFromSizeArray(sizes);
		if (allSizeStock > 0) {
			const sizeList = getSizeListStringFromSizes(sizes, size_type);
			answer = `ตอนนี้เหลือ\n${sizeList} นิหื๊ออออ~ \nพิเลือกๆๆเลย...`;
		} else {
			answer = `แต่ตอนนี้ของหมดล๊าวว~ พิมะต้องเลือกๆ`;
		}
	} else {
		if (stock > 0) {
			answer = `ตอนนี้เหลืออยู่ ${stock} อันนิหื๊ออออ~\nพิเลือกๆๆเลย...`;
		} else {
			answer = `แต่ตอนนี้ของหมดล๊าวว~ พิมะต้องเลือกๆ`;
		}
	}
	return answer;
};
