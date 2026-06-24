const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const userService = require('../services/userService');

exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user._id;
  const profile = await userService.getUserProfile(userId);
  return apiResponse.success(res, 'Profile retrieved successfully', profile);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateUserProfile(req.user._id, req.body);
  return apiResponse.success(res, 'Profile updated successfully', profile);
});

exports.uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }
  const user = await userService.uploadProfilePicture(req.user._id, req.file.buffer);
  return apiResponse.success(res, 'Profile photo uploaded successfully', { profilePicture: user.profilePicture });
});

exports.uploadCoverPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }
  const user = await userService.uploadCoverPhoto(req.user._id, req.file.buffer);
  return apiResponse.success(res, 'Cover photo uploaded successfully', { coverPhoto: user.coverPhoto });
});

// Experience section
exports.addExperience = asyncHandler(async (req, res) => {
  const experience = await userService.addExperience(req.user._id, req.body);
  return apiResponse.success(res, 'Experience added successfully', experience, 201);
});

exports.updateExperience = asyncHandler(async (req, res) => {
  const experience = await userService.updateExperience(req.user._id, req.params.id, req.body);
  return apiResponse.success(res, 'Experience updated successfully', experience);
});

exports.deleteExperience = asyncHandler(async (req, res) => {
  await userService.deleteExperience(req.user._id, req.params.id);
  return apiResponse.success(res, 'Experience deleted successfully');
});

// Education section
exports.addEducation = asyncHandler(async (req, res) => {
  const education = await userService.addEducation(req.user._id, req.body);
  return apiResponse.success(res, 'Education added successfully', education, 201);
});

exports.updateEducation = asyncHandler(async (req, res) => {
  const education = await userService.updateEducation(req.user._id, req.params.id, req.body);
  return apiResponse.success(res, 'Education updated successfully', education);
});

exports.deleteEducation = asyncHandler(async (req, res) => {
  await userService.deleteEducation(req.user._id, req.params.id);
  return apiResponse.success(res, 'Education deleted successfully');
});

// Skills section
exports.addSkill = asyncHandler(async (req, res) => {
  const skill = await userService.addSkill(req.user._id, req.body.skillName);
  return apiResponse.success(res, 'Skill added successfully', skill, 201);
});

exports.removeSkill = asyncHandler(async (req, res) => {
  await userService.removeSkill(req.user._id, req.params.id);
  return apiResponse.success(res, 'Skill removed successfully');
});

exports.endorseSkill = asyncHandler(async (req, res) => {
  const skill = await userService.endorseSkill(req.user._id, req.params.id);
  return apiResponse.success(res, 'Skill endorsement updated', skill);
});

exports.searchUsers = asyncHandler(async (req, res) => {
  const users = await userService.searchUsers(req.query.q);
  return apiResponse.success(res, 'Users retrieved successfully', users);
});

