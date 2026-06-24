const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', connectionController.getConnections);
router.get('/pending', connectionController.getPendingRequests);
router.post('/request', connectionController.sendRequest);
router.put('/request/:id/accept', connectionController.acceptRequest);
router.put('/request/:id/reject', connectionController.rejectRequest);
router.delete('/:id', connectionController.removeConnection);

module.exports = router;
