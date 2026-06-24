const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createPostValidator } = require('../validators/postValidator');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/feed', postController.getFeed);
router.get('/saved', postController.getSavedPosts);

router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  createPostValidator,
  validate,
  postController.createPost
);

router.put('/:id', createPostValidator, validate, postController.updatePost);
router.delete('/:id', postController.deletePost);

router.post('/:id/like', postController.toggleLikePost);
router.post('/:id/save', postController.savePost);
router.delete('/:id/save', postController.removeSavedPost);

module.exports = router;
