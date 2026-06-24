const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const jobService = require('../services/jobService');
const Job = require('../models/Job');

exports.createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.user._id, req.body);
  return apiResponse.success(res, 'Job posted successfully', job, 201);
});

exports.updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.user._id, req.params.id, req.body);
  return apiResponse.success(res, 'Job updated successfully', job);
});

exports.deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.user._id, req.params.id);
  return apiResponse.success(res, 'Job deleted successfully');
});

exports.applyJob = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload your resume (PDF/Document)');
  }
  const app = await jobService.applyJob(req.user._id, req.params.id, req.file.buffer);
  return apiResponse.success(res, 'Applied for job successfully', app, 201);
});

exports.getAppliedJobs = asyncHandler(async (req, res) => {
  const apps = await jobService.getAppliedJobs(req.user._id);
  return apiResponse.success(res, 'Applied jobs retrieved successfully', apps);
});

exports.getApplicants = asyncHandler(async (req, res) => {
  const applicants = await jobService.getApplicantsForJob(req.user._id, req.params.id);
  return apiResponse.success(res, 'Applicants retrieved successfully', applicants);
});

exports.getJobDetails = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('company', 'name logo industry description website')
    .populate('postedBy', 'name email headline profilePicture');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  return apiResponse.success(res, 'Job details retrieved successfully', job);
});

exports.searchJobs = asyncHandler(async (req, res) => {
  const { q, location } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  const jobs = await Job.find(filter)
    .populate('company', 'name logo industry')
    .sort({ createdAt: -1 });

  return apiResponse.success(res, 'Jobs retrieved successfully', jobs);
});
