const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const postService = require('../services/postService');

exports.createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await postService.createPost(req.user._id, content, req.files);
  return apiResponse.success(res, 'Post created successfully', post, 201);
});

exports.updatePost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await postService.updatePost(req.user._id, req.params.id, content);
  return apiResponse.success(res, 'Post updated successfully', post);
});

exports.deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.user._id, req.params.id);
  return apiResponse.success(res, 'Post deleted successfully');
});

exports.toggleLikePost = asyncHandler(async (req, res) => {
  const result = await postService.toggleLikePost(req.user._id, req.params.id);
  const action = result.liked ? 'liked' : 'unliked';

  if (result.liked) {
    const { createNotification } = require('./notificationController');
    await createNotification(
      result.post.author,
      req.user._id,
      'like',
      `${req.user.name} liked your post`,
      result.post._id
    );
  }

  return apiResponse.success(res, `Post ${action} successfully`, result.post);
});


exports.getFeed = asyncHandler(async (req, res) => {
  const posts = await postService.getFeed(req.user._id);
  return apiResponse.success(res, 'Feed retrieved successfully', posts);
});

exports.savePost = asyncHandler(async (req, res) => {
  const saved = await postService.savePost(req.user._id, req.params.id);
  return apiResponse.success(res, 'Post saved successfully', saved, 201);
});

exports.removeSavedPost = asyncHandler(async (req, res) => {
  await postService.removeSavedPost(req.user._id, req.params.id);
  return apiResponse.success(res, 'Post unsaved successfully');
});

exports.getSavedPosts = asyncHandler(async (req, res) => {
  const saved = await postService.getSavedPosts(req.user._id);
  return apiResponse.success(res, 'Saved posts retrieved successfully', saved);
});
