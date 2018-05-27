const router = require("express").Router();
const productController = require("../controllers/product.controller");

router.get("/products", productController.getAllProducts);
router.get("/product/:id", productController.getProductById);
router.post("/product", productController.createProduct);
router.delete("/product", productController.deleteProduct);
router.put("/product", productController.updateProduct);

module.exports = router;
