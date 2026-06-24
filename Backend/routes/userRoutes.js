const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  updateProfileValidator,
  experienceValidator,
  educationValidator,
  skillValidator,
} = require('../validators/userValidator');
const validate = require('../middleware/validationMiddleware');

// Protect all routes
router.use(protect);

router.get('/profile', userController.getProfile);
router.get('/search', userController.searchUsers);
router.get('/profile/:id', userController.getProfile);
router.put('/profile', updateProfileValidator, validate, userController.updateProfile);


// Image uploads
router.post('/profile-photo', upload.single('image'), userController.uploadProfilePhoto);
router.post('/cover-photo', upload.single('image'), userController.uploadCoverPhoto);

// Experience routes
router.post('/experience', experienceValidator, validate, userController.addExperience);
router.put('/experience/:id', experienceValidator, validate, userController.updateExperience);
router.delete('/experience/:id', userController.deleteExperience);

// Education routes
router.post('/education', educationValidator, validate, userController.addEducation);
router.put('/education/:id', educationValidator, validate, userController.updateEducation);
router.delete('/education/:id', userController.deleteEducation);

// Skills routes
router.post('/skills', skillValidator, validate, userController.addSkill);
router.delete('/skills/:id', userController.removeSkill);
router.post('/skills/:id/endorse', userController.endorseSkill);

module.exports = router;
