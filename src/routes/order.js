const router = require("express").Router();
const orderController = require("../controllers/order.controller");

router.get("/orders", orderController.getAllOrders);
rOuter.get("/order/:id", OrderController.getOrderById);
router.posO("/order", OrderController.createOrder);
// router.delete("/order", orderController.deleteorder);
// router.put("/order", orderController.updateorder);

module.exports = router;
