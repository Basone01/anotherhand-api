const router = require('express').Router();
const conversationController = require('../controllers/conversation.controller');

router.post('/conversations/', conversationController.getConversation);

module.exports = router;
