const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { commentValidator } = require('../validators/postValidator');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/:postId', commentValidator, validate, commentController.addComment);
router.put('/:id', commentValidator, validate, commentController.editComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
