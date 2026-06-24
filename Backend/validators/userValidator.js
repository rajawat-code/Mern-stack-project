const { body } = require('express-validator');

exports.updateProfileValidator = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('headline').optional().trim(),
  body('about').optional().trim(),
  body('location').optional().trim(),
];

exports.experienceValidator = [
  body('companyName').notEmpty().withMessage('Company name is required').trim(),
  body('designation').notEmpty().withMessage('Designation is required').trim(),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().toDate().withMessage('Start date must be a valid date'),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().withMessage('End date must be a valid date'),
  body('currentCompany').optional().isBoolean().withMessage('currentCompany must be a boolean'),
  body('description').optional().trim(),
];

exports.educationValidator = [
  body('collegeName').notEmpty().withMessage('College name is required').trim(),
  body('degree').notEmpty().withMessage('Degree is required').trim(),
  body('fieldOfStudy').notEmpty().withMessage('Field of study is required').trim(),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().toDate().withMessage('Start date must be a valid date'),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().withMessage('End date must be a valid date'),
  body('grade').optional().trim(),
  body('description').optional().trim(),
];

exports.skillValidator = [
  body('skillName').notEmpty().withMessage('Skill name is required').trim(),
];
