const router = require("express").Router();
const orderController = require("../controllers/order.controller");

router.get("/orders", orderController.getAllOrders);
router.get("/order/:id", orderController.getOrderById);
router.post("/order", orderController.createOrder);
// router.delete("/order", orderController.deleteorder);
// router.put("/order", orderController.updateorder);

module.exports = router;
