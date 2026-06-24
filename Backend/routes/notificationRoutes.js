const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markRead,
  markAllRead,
  clearNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllRead);
router.put('/:id/read', markRead);
router.delete('/', clearNotifications);

module.exports = router;
