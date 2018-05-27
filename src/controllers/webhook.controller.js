const config = require("../config");
const ConversationModel = require("../models/conversation");
const utils = require("../utils");
const services = require("../services");
const mockupProductsArray = require("../utils/sampleProducts.json");
const ProductModel = require("../models/product");

function verifyWebhookAPI(req, res, next) {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === config.FB_WEBHOOK_TOKEN
  ) {
    console.log("Validating webhook");
    return res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    return res.sendStatus(403);
  }
}

async function handleFacebookMessage(req, res, next) {
  try {
    var FacebookMessages = req.body.entry;
    await storeConversation(FacebookMessages);
    await catchImageAttachment(FacebookMessages);
    return res.sendStatus(200);
  } catch (error) {
    return next(error);
  }
}

//end of route function

const storeConversation = async messageEntry => {
  try {
    messageEntry.forEach(async message => {
      const { messaging, id, time, ...rest } = message;
      await utils.asyncForEach(messaging, async msg => {
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
        console.log("customer:", id === msg.sender.id ? id : msg.sender.id);
      });
    });
  } catch (error) {
    throw error;
  }
};

async function catchImageAttachment(messageEntry) {
  try {
    messageEntry.forEach(async messageObject => {
      const { messaging, id: shop_id } = messageObject;
      //filter and get only customer messages
      const customerMessages = messaging.filter(
        msg => msg.sender.id !== shop_id
      );
      //masages always come in array form
      await utils.asyncForEach(customerMessages, async msg => {
        const customer_id = msg.sender.id;
        //ignore page's and plain message
        if (!("message" in msg)) {
          console.log("=========NO MSG=========");
          //   console.log(JSON.stringify(msg, null, 3));
          //   console.log("==================");
          return;
        }
        if (!("attachments" in msg.message)) {
          console.log("=========NO ATTACHMENTS=========");
          // console.log(JSON.stringify(msg, null, 3));
          // console.log("==================");
          return;
        }

        //find all products
        const productsFromDB = await ProductModel.find({});
        //tell the customer I'm finding
        await services.FacebookAPI.sendMessage(
          customer_id,
          config.FB_PAGE_TOKEN,
          "หาแปปเอ่าะ..."
        );
        //attachment always come in array
        await utils.asyncForEach(
          msg.message.attachments,
          async (attachment, index, self) => {
            //catch if it is image
            if (attachment.type === "image") {
              console.log("I got an Image");
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
          }
        );
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

//start finding product from image
const findProductFromImageAndAnswerToCustomer = async (
  screenshotImage,
  productsFromDB,
  customerFbId,
  index,
  length
) => {
  const matchedResult = await services.imageService.findMatchedProduct(
    screenshotImage,
    productsFromDB
  );
  const answerPrefix =
    length > 1 ? `รูป${!index ? "แรก" : `ที่ ${index + 1}`}:` : "";
  if (!matchedResult) {
    console.log("Not Found this Product!");
    await services.FacebookAPI.sendMessage(
      customerFbId,
      config.FB_PAGE_TOKEN,
      `${answerPrefix}หาไม่เจอหงะ!!!`
    );
  } else {
    // console.log('========================================');
    // console.log(matchedResult);
    // console.log('========================================');
    const { matchedProduct, matchedImage } = matchedResult;
    //response with the matched image
    await services.FacebookAPI.sendMessage(
      customerFbId,
      config.FB_PAGE_TOKEN,
      `${answerPrefix}เจอล๊าวววว!!!\nพิเลือกๆๆเลย...`
    );

    await services.FacebookAPI.sendProduct(
      customerFbId,
      config.FB_PAGE_TOKEN,
      matchedProduct
    );
    // await services.FacebookAPI.sendMessage(
    //   customerFbId,
    //   config.FB_PAGE_TOKEN,
    //   answerPrefix + matchedProduct.name
    // );

    // await services.FacebookAPI.sendImage(
    //   customerFbId,
    //   config.FB_PAGE_TOKEN,
    //   matchedImage
    // );

    // let answer = getRemainingStockAnswerFromMatchedProduct(matchedProduct);

    // await services.FacebookAPI.sendMessage(
    //   customerFbId,
    //   config.FB_PAGE_TOKEN,
    //   answerPrefix + answer
    // );
  }
};

//Get Answer about remaining stock
const getCountFromSizeArray = sizeArray => {
  return sizeArray.reduce((count, size) => {
    return count + size.stock;
  }, 0);
};
const getSizeListStringFromSizes = (sizes, size_type) => {
  return sizes
    .filter(size => size.stock > 0)
    .map(size => `${size.size}${size_type}`)
    .join(", ");
};

const getRemainingStockAnswerFromMatchedProduct = matchedProduct => {
  const { sizes, size_type, stock } = matchedProduct;
  let answer = "";

  if (sizes.length > 0) {
    const allSizeStock = getCountFromSizeArray(sizes);
    if (allSizeStock > 0) {
      const sizeList = getSizeListStringFromSizes(sizes, size_type);
      answer = `ตอนนี้เหลือ\n${sizeList} นิหื๊ออออ~`;
    } else {
      answer = `แต่ตอนนี้หมดล๊าวว~ พิมะต้องเลือกๆ`;
    }
  } else {
    if (stock > 0) {
      answer = `ตอนนี้เหลืออยู่ ${stock} อันนิหื๊ออออ~`;
    } else {
      answer = `แต่ตอนนี้หมดล๊าวว~ พิมะต้องเลือกๆ`;
    }
  }
  return answer;
};
