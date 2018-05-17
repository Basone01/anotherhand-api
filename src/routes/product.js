const router = require("express").Router();
const productController = require("../controllers/product.controller");
const Uploader = require("../services/uploader");

router.get("/products", productController.getAllProducts);
router.get("/product/:id", productController.getProductById);
router.post(
	"/product",
	Uploader.array("images"),
	productController.createProduct
);

module.exports = router;
