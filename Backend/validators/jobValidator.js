const { body } = require('express-validator');

exports.createJobValidator = [
  body('title').notEmpty().withMessage('Job title is required').trim(),
  body('description').notEmpty().withMessage('Job description is required').trim(),
  body('location').notEmpty().withMessage('Job location is required').trim(),
  body('company').notEmpty().withMessage('Company reference ID is required').isMongoId().withMessage('Invalid Company ID'),
  body('salary').optional().trim(),
  body('skillsRequired').optional().isArray().withMessage('skillsRequired must be an array of strings'),
];

exports.createCompanyValidator = [
  body('name').notEmpty().withMessage('Company name is required').trim(),
  body('description').optional().trim(),
  body('industry').optional().trim(),
  body('website').optional().trim(),
];
