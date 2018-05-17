const router = require("express").Router();
const shopController = require("../controllers/shop.controller");

router.get("/shop", shopController.getMyShop);
router.post("/shop", shopController.createShop);

module.exports = router;
