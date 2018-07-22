const router = require('express').Router();
const shopController = require('../controllers/shop.controller');

router.get('/shop/:id', shopController.getShop);
router.post('/shop', shopController.createShop);
router.patch('/shop/autoreply', shopController.toggleAutoReply);
router.delete('/shop', shopController.deleteShop);

module.exports = router;
