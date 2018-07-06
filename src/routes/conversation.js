const router = require('express').Router();
const conversationController = require('../controllers/conversation.controller');

router.get('/conversations', conversationController.getConversation);

module.exports = router;
