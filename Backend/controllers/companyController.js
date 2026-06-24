const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const jobService = require('../services/jobService');
const Company = require('../models/Company');

exports.createCompany = asyncHandler(async (req, res) => {
  const logoBuffer = req.file ? req.file.buffer : null;
  const company = await jobService.createCompany(req.user._id, req.body, logoBuffer);
  return apiResponse.success(res, 'Company created successfully', company, 201);
});

exports.updateCompany = asyncHandler(async (req, res) => {
  const logoBuffer = req.file ? req.file.buffer : null;
  const company = await jobService.updateCompany(req.user._id, req.params.id, req.body, logoBuffer);
  return apiResponse.success(res, 'Company updated successfully', company);
});

exports.toggleFollow = asyncHandler(async (req, res) => {
  const result = await jobService.toggleFollowCompany(req.user._id, req.params.id);
  const action = result.following ? 'followed' : 'unfollowed';
  return apiResponse.success(res, `Company ${action} successfully`, result.company);
});

exports.getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).populate('followers', 'name headline profilePicture');
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }
  return apiResponse.success(res, 'Company retrieved successfully', company);
});

exports.searchCompanies = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const query = q ? { name: { $regex: q, $options: 'i' } } : {};
  const companies = await Company.find(query).limit(20);
  return apiResponse.success(res, 'Companies retrieved successfully', companies);
});
