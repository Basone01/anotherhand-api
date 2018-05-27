const config = require("../config");
const { helper } = require("../utils/");
const ProductModel = require("../models/product");
const ShopModel = require("../models/shop");
const Types = require("mongoose").Types;
const path = require("path");
const sharp = require("sharp");
const mkdirp = require("mkdirp");
const fs = require("fs");
const base64toBuffer = require("../utils/base64decoder");
const rimraf = require("rimraf");
//tell sharp don't lock the original file to make sure it can be delete
sharp.cache(true);
async function createProduct(req, res, next) {
  //bind shop id if in development
  let product = config.DEV_MODE
    ? {
        ...req.body,
        shop_id: config.DEV_SHOP_ID
      }
    : req.body;

  const { shop_id } = product;

  try {
    //shop must be exists
    const shop = await ShopModel.findOne({ _id: product.shop_id });
    if (!shop) {
      throw new Error("Your shop doesn't exist");
    }

    //create folder path
    product._id = new Types.ObjectId();
    const { _id, images } = product;
    const folder = path.join(
      __dirname,
      "..",
      `public/images/${shop_id}/${_id}`
    );
    //create folder
    mkdirp(folder, async (err, created) => {
      if (err) {
        throw err;
      } else {
        try {
          const images_path = await storeProductImagesAndGetFilename(
            images,
            folder
          );
          product.images = images_path;
          console.log(product);
          //finished preparing data, now add it to database
          const newProduct = await ProductModel.create(product);
          console.log(newProduct);
          //add refs to shop
          const shopResult = await ShopModel.update(
            { _id: newProduct.shop_id },
            {
              $push: {
                products: newProduct._id
              }
            }
          );
          //send the result back
          return res.json(newProduct.toJSON({ virtuals: true }));
        } catch (error) {
          console.log("SHARPPPP", error);
          next(error);
        }
      }
    }); //end mkdirp
  } catch (error) {
    console.log("OUTER", error);
    return next(error);
  }
}

async function getAllProducts(req, res, next) {
  const shop_detail = config.DEV_MODE ? { shop_id: config.DEV_SHOP_ID } : {};
  try {
    const products = await ProductModel.find(shop_detail);
    return res.json(
      products.map(product => product.toObject({ virtuals: true }))
    );
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      throw new Error("not found");
    }
    return res.json(product.toJSON({ virtuals: true }));
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  const { _id } = req.body;
  if (!_id) next(new Error("no _id specified"));
  try {
    const deletingProduct = await ProductModel.findByIdAndRemove(_id);
    console.log(deletingProduct);
    rimraf(
      path.join(
        __dirname,
        `../public/images/${deletingProduct.shop_id}/${deletingProduct._id}`
      ),
      err => {
        if (err) {
          console.log(err);
          throw err;
        }
        res.json({ success: true });
      }
    );
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  const { _id } = req.body;
  if (!_id) next(new Error("no _id specified"));
  try {
    let updatingProduct = req.body;
    console.log(updatingProduct);
    const oldImage = updatingProduct.images.filter(
      image => !image.includes("data:")
    );
    const newImage = updatingProduct.images.filter(image =>
      image.includes("data:")
    );
    const folder = path.join(
      __dirname,
      `../public/images/${updatingProduct.shop_id}/${updatingProduct._id}`
    );
    //storeNewImage
    const storedImage = await storeProductImagesAndGetFilename(
      newImage,
      folder
    );
    updatingProduct.images = [...oldImage, ...storedImage];
    let updatedProduct = await ProductModel.findByIdAndUpdate(_id, {
      $set: {
        ...updatingProduct
      }
    });
    console.log(updatedProduct);
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProductById,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct
};

async function storeProductImagesAndGetFilename(base64Images, dest) {
  try {
    const images_path = await Promise.all(
      base64Images.map(async (image, index) => {
        try {
          //resize and encode to jpeg and store in the folder that has created before
          const { data } = base64toBuffer(image);
          const filename = `${index}-${Date.now()}.jpg`;
          await sharp(data)
            .resize(1024, 1024)
            .max()
            .jpeg()
            .toFile(path.join(dest, filename));

          // return file name to array
          return filename;
        } catch (error) {
          console.log("SHARPPPP", error);
          throw error;
        }
      })
    );
    return images_path;
  } catch (error) {
    console.log("SHARPPPP", error);
    throw error;
  }
}
