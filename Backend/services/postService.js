const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const SavedPost = require('../models/SavedPost');
const { uploadBuffer } = require('../config/cloudinary');

const createPost = async (userId, content, files) => {
  let imageUrl = '';
  let videoUrl = '';

  if (files && files.image) {
    imageUrl = await uploadBuffer(files.image[0].buffer, 'image');
  }
  if (files && files.video) {
    videoUrl = await uploadBuffer(files.video[0].buffer, 'video');
  }

  const post = await Post.create({
    author: userId,
    content,
    image: imageUrl,
    video: videoUrl,
  });

  return post;
};

const updatePost = async (userId, postId, content) => {
  const post = await Post.findOneAndUpdate(
    { _id: postId, author: userId },
    { content },
    { new: true, runValidators: true }
  );
  if (!post) {
    throw new Error('Post not found or unauthorized');
  }
  return post;
};

const deletePost = async (userId, postId) => {
  const post = await Post.findOneAndDelete({ _id: postId, author: userId });
  if (!post) {
    throw new Error('Post not found or unauthorized');
  }
  // Delete comments of this post
  await Comment.deleteMany({ postId });
  // Remove from saved posts
  await SavedPost.deleteMany({ postId });
  return post;
};

const toggleLikePost = async (userId, postId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const liked = post.likes.includes(userId);
  if (liked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    post.likes.push(userId);
  }

  await post.save();
  return { post, liked: !liked };
};

const getFeed = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Feed consists of own posts + posts from connections
  const authorIds = [userId, ...user.connections];

  const posts = await Post.find({ author: { $in: authorIds } })
    .populate('author', 'name email headline profilePicture')
    .populate({
      path: 'comments',
      populate: { path: 'userId', select: 'name email headline profilePicture' },
    })
    .sort({ createdAt: -1 });

  return posts;
};

const addComment = async (userId, postId, commentText) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const comment = await Comment.create({
    postId,
    userId,
    commentText,
  });

  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });

  return comment;
};

const editComment = async (userId, commentId, commentText) => {
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, userId },
    { commentText },
    { new: true, runValidators: true }
  );
  if (!comment) {
    throw new Error('Comment not found or unauthorized');
  }
  return comment;
};

const deleteComment = async (userId, commentId) => {
  const comment = await Comment.findOneAndDelete({ _id: commentId, userId });
  if (!comment) {
    throw new Error('Comment not found or unauthorized');
  }

  await Post.findByIdAndUpdate(comment.postId, {
    $pull: { comments: commentId },
  });

  return comment;
};

// Saved Post logic
const savePost = async (userId, postId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const savedPost = await SavedPost.create({ userId, postId });
  return savedPost;
};

const removeSavedPost = async (userId, postId) => {
  const savedPost = await SavedPost.findOneAndDelete({ userId, postId });
  if (!savedPost) {
    throw new Error('Saved post not found');
  }
  return savedPost;
};

const getSavedPosts = async (userId) => {
  const saved = await SavedPost.find({ userId })
    .populate({
      path: 'postId',
      populate: { path: 'author', select: 'name email headline profilePicture' },
    });
  return saved.map((s) => s.postId).filter(Boolean);
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getFeed,
  addComment,
  editComment,
  deleteComment,
  savePost,
  removeSavedPost,
  getSavedPosts,
};
