const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/conversation/:conversationId', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.put('/seen/:conversationId', messageController.markSeen);

module.exports = router;
