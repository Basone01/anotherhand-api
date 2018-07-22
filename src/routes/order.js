const router = require('express').Router();
const orderController = require('../controllers/order.controller');

router.get('/orders', orderController.getAllOrders);
router.get('/order/:id', orderController.getOrderById);
router.post('/order', orderController.createOrder);
router.patch('/order/cancel', orderController.cancelOrder);
router.patch('/order/status', orderController.updateOrderStatus);

module.exports = router;
