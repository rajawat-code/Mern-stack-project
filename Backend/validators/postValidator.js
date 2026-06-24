const { body } = require('express-validator');

exports.createPostValidator = [
  body('content').notEmpty().withMessage('Post content is required').trim(),
];

exports.commentValidator = [
  body('commentText').notEmpty().withMessage('Comment text is required').trim(),
];
