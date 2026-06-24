const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const { uploadBuffer } = require('../config/cloudinary');

// Company operations
const createCompany = async (userId, companyData, logoFileBuffer) => {
  let logoUrl = '';
  if (logoFileBuffer) {
    logoUrl = await uploadBuffer(logoFileBuffer, 'image');
  }

  const company = await Company.create({
    ...companyData,
    logo: logoUrl,
    createdBy: userId,
  });

  return company;
};

const updateCompany = async (userId, companyId, companyData, logoFileBuffer) => {
  const updates = { ...companyData };
  if (logoFileBuffer) {
    updates.logo = await uploadBuffer(logoFileBuffer, 'image');
  }

  const company = await Company.findOneAndUpdate(
    { _id: companyId, createdBy: userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!company) {
    throw new Error('Company not found or unauthorized');
  }

  return company;
};

const toggleFollowCompany = async (userId, companyId) => {
  const company = await Company.findById(companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  const following = company.followers.includes(userId);
  if (following) {
    company.followers = company.followers.filter((id) => id.toString() !== userId.toString());
  } else {
    company.followers.push(userId);
  }

  await company.save();
  return { company, following: !following };
};

// Job operations
const createJob = async (userId, jobData) => {
  const job = await Job.create({
    ...jobData,
    postedBy: userId,
  });
  return job;
};

const updateJob = async (userId, jobId, jobData) => {
  const job = await Job.findOneAndUpdate(
    { _id: jobId, postedBy: userId },
    jobData,
    { new: true, runValidators: true }
  );

  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  return job;
};

const deleteJob = async (userId, jobId) => {
  const job = await Job.findOneAndDelete({ _id: jobId, postedBy: userId });
  if (!job) {
    throw new Error('Job not found or unauthorized');
  }
  // Delete all applications for this job
  await Application.deleteMany({ jobId });
  return job;
};

const applyJob = async (userId, jobId, resumeFileBuffer) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // Check if already applied
  const existingApp = await Application.findOne({ jobId, applicantId: userId });
  if (existingApp) {
    throw new Error('You have already applied for this job');
  }

  let resumeUrl = '';
  if (resumeFileBuffer) {
    resumeUrl = await uploadBuffer(resumeFileBuffer, 'raw'); // Raw upload for PDFs/Docs
  } else {
    throw new Error('Resume file is required');
  }

  const application = await Application.create({
    jobId,
    applicantId: userId,
    resume: resumeUrl,
    status: 'applied',
  });

  return application;
};

const getAppliedJobs = async (userId) => {
  const applications = await Application.find({ applicantId: userId })
    .populate({
      path: 'jobId',
      populate: { path: 'company', select: 'name logo industry' },
    });
  return applications;
};

const getApplicantsForJob = async (userId, jobId) => {
  // Verify job ownership
  const job = await Job.findOne({ _id: jobId, postedBy: userId });
  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  const applicants = await Application.find({ jobId })
    .populate('applicantId', 'name email headline profilePicture');
  return applicants;
};

module.exports = {
  createCompany,
  updateCompany,
  toggleFollowCompany,
  createJob,
  updateJob,
  deleteJob,
  applyJob,
  getAppliedJobs,
  getApplicantsForJob,
};
