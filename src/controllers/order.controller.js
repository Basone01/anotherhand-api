const config = require("../config");
const ProductModel = require("../models/product");
const OrderModel = require("../models/order");
const Types = require("mongoose").Types;
const path = require("path");




async function getAllOrders(req, res, next) {
  const shop_detail = config.DEV_MODE ? {
    shop_id: config.DEV_SHOP_ID
  } : {};
  try {
    const orders = await PrderModel.find(shop_detail);
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      throw new Error("not found");
    }
    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

async function deleteOrder(req, res, next) {
  const {_id} = req.body;
  if (!_id) next(new Error("no _id specified"));
  try {
    const deletingProduct = await OrderModel.findByIdAndRemove(_id);
    console.log(deletingOrder);
    rimraf(
      path.join(
        __dirname,
        `../public/images/${deletingOrder.shop_id}/${deletingOrder._id}`
      ),
      err => {
        if (err) {
          console.log(err);
          throw err;
        }
        res.json({
          success: true
        });
      }
    );
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getProductById,
  getAllProducts,
  deleteProduct,

};


