const {
	getProductDisplayPriceRange,
	isProductOutOfStock,
	getProductRemainingStockAnswer
} = require('../../models/productHelperFunction');
const ProductModel = require('../../models/product');
const OrderModel = require('../../models/order');
const ShopModel = require('../../models/shop');
const FacebookAPI = require('./index');
const utils = require('../../utils/index');
const config = require('../../config/index');
const { addCustomerProfileToOrder } = require('./index');
//main function
const catchPostback = async (messageEntry, socket) => {
	try {
		messageEntry.forEach(async (message) => {
			const { messaging, id, time, ...rest } = message;
			await utils.asyncForEach(messaging, async (msg) => {
				try {
					if ('postback' in msg) {
						let payload = null;
						try {
							payload = JSON.parse(msg.postback.payload);
						} catch (error) {
							return;
						}

						switch (payload.req) {
							case 'getDetails':
								console.log('GET D');
								await handleMoreDetails(msg.sender.id, id, payload._id);
								break;

							case 'getImages':
								console.log('IMAGE');
								await handleMoreImage(msg.sender.id, id, payload._id);
								break;
							case 'placeOrder':
								console.log('ORDER');
								const order = await handlePlaceOrder(msg.sender.id, id, payload._id);
								const shop = await ShopModel.findOne({ fb_page_id: id });
								const orderWithCustomerProfile = await addCustomerProfileToOrder(
									order,
									shop.fb_page_token
								);
								socket.sockets.to(id).emit('order', orderWithCustomerProfile);
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

// when user place order

const handlePlaceOrder = async (customer_fb_id, shop_id, product_id) => {
	try {
		const product = await ProductModel.findById(product_id);
		console.log(product);
		if (!product) {
			throw new Error('Product Not Found');
		}
		else {
			if (isProductOutOfStock(product)) {
				return await FacebookAPI.sendMessage({
					targetUserID: customer_fb_id,
					token: config.FB_PAGE_TOKEN,
					text: 'ก็บอกว่าของหมดไงฟร้ะะ!! \nฟังม่ายรุเรื่องอ๋อออ~!!!'
				});
			}

			const shop = await ShopModel.findOne({ fb_page_id: shop_id });
			const order = new OrderModel({
				product: product_id,
				customer_id: customer_fb_id,
				shop: shop._id,
				total_price: product.price,
				date: Date.now()
			});
			console.log(order);
			const savedOrder = await order.save();
			if (!savedOrder) {
				throw new Error('Error When Creating Order');
			}
			else {
				await FacebookAPI.sendMessage({
					targetUserID: customer_fb_id,
					token: config.FB_PAGE_TOKEN,
					text: 'โอเคค๊าบบบ'
				});
				await FacebookAPI.sendMessage({
					targetUserID: customer_fb_id,
					token: config.FB_PAGE_TOKEN,
					text: `${product.name} นะ`
				});
				await FacebookAPI.sendMessage({
					targetUserID: customer_fb_id,
					token: config.FB_PAGE_TOKEN,
					text: `ทั้งหมด ${product.price} บาทจ้า`
				});
				await FacebookAPI.sendMessage({
					targetUserID: customer_fb_id,
					token: config.FB_PAGE_TOKEN,
					text: `เลขบัญชีมะบอกหรอก!~\nแต่ชำระเงินแล้วอย่าลืม\nส่งที่ชื่ออยู่ เบอร์โทรให้น้องบอทด้วยเน้อออ~`
				});
				return { ...savedOrder.toObject(), product };
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
		}
		else {
			product.images.forEach(async (image) => {
				try {
					await FacebookAPI.sendImage({
						targetUserID: customer_fb_id,
						token: config.FB_PAGE_TOKEN,
						imagePath: image
					});
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
		}
		else {
			try {
				let displayPrice = getProductDisplayPriceRange(product);
				await FacebookAPI.sendMessage({
					targetUserID: customer_fb_id,
					token: config.FB_PAGE_TOKEN,
					text: `สินค้า: ${product.name}\nราคา: ${displayPrice} บาท\nรายละเอียด: ${product.description}`
				});

				await FacebookAPI.sendMessage({
					targetUserID: customer_fb_id,
					token: config.FB_PAGE_TOKEN,
					text: getProductRemainingStockAnswer(product)
				});

				return true;
			} catch (error) {
				throw error;
			}
		}
	} catch (error) {
		throw error;
	}
};

module.exports = catchPostback;
