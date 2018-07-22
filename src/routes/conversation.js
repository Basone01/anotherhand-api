const router = require('express').Router();
const conversationController = require('../controllers/conversation.controller');

router.post('/conversations/', conversationController.getConversation);
router.post('/conversation/profile', conversationController.getConversationProfile);
router.post('/conversation/send/message', conversationController.sendMessageToFacebook);
router.post('/conversation/send/product', conversationController.sendProductToCustomer);

module.exports = router;
