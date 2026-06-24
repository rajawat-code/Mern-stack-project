const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const postService = require('../services/postService');

exports.addComment = asyncHandler(async (req, res) => {
  const comment = await postService.addComment(req.user._id, req.params.postId, req.body.commentText);

  // Notify author of post
  const Post = require('../models/Post');
  const post = await Post.findById(req.params.postId);
  if (post) {
    const { createNotification } = require('./notificationController');
    await createNotification(
      post.author,
      req.user._id,
      'comment',
      `${req.user.name} commented on your post`,
      post._id
    );
  }

  return apiResponse.success(res, 'Comment added successfully', comment, 201);
});


exports.editComment = asyncHandler(async (req, res) => {
  const comment = await postService.editComment(req.user._id, req.params.id, req.body.commentText);
  return apiResponse.success(res, 'Comment updated successfully', comment);
});

exports.deleteComment = asyncHandler(async (req, res) => {
  await postService.deleteComment(req.user._id, req.params.id);
  return apiResponse.success(res, 'Comment deleted successfully');
});
