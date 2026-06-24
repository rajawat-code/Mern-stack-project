const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const generateToken = require('../utils/generateToken');

// Mock Cloudinary uploads
jest.mock('../config/cloudinary', () => ({
  uploadBuffer: jest.fn().mockResolvedValue('https://res.cloudinary.com/mock-resume-url.pdf'),
  cloudinary: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

describe('Job API Endpoints', () => {
  let user, token, headers, company;

  beforeEach(async () => {
    user = await User.create({
      name: 'Job Recruiter',
      email: 'recruiter@example.com',
      password: 'Password123!',
    });

    const mockRes = { cookie: jest.fn() };
    token = generateToken(mockRes, user._id);
    headers = { 'Authorization': `Bearer ${token}` };

    // Create a mock company for the job postings
    company = await Company.create({
      name: 'Test Tech Inc',
      description: 'Cool tech company',
      industry: 'Software',
      logo: 'https://logo.com/pic.png',
      createdBy: user._id,
    });
  });

  it('should manage job creation, search, application, and applicants retrieval', async () => {
    const jobData = {
      title: 'Full Stack Engineer',
      description: 'Looking for a Senior dev',
      location: 'New York, NY',
      company: company._id.toString(),
      salary: '$150k - $180k',
      skillsRequired: ['React', 'Node.js', 'MongoDB'],
    };

    // 1. Create Job
    let res = await request(app)
      .post('/api/jobs')
      .set(headers)
      .send(jobData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(jobData.title);
    const jobId = res.body.data._id;

    // 2. Search Jobs
    res = await request(app)
      .get('/api/jobs?title=Full&location=New')
      .set(headers);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toBe(jobData.title);

    // 3. Get Job Details
    res = await request(app)
      .get(`/api/jobs/${jobId}`)
      .set(headers);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.title).toBe(jobData.title);

    // 4. Apply for Job
    const buffer = Buffer.from('mock resume pdf content');
    res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set(headers)
      .attach('resume', buffer, 'resume.pdf');

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resume).toBe('https://res.cloudinary.com/mock-resume-url.pdf');

    // 5. Get Applied Jobs
    res = await request(app)
      .get('/api/jobs/applied')
      .set(headers);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].jobId._id).toBe(jobId);

    // 6. Get Applicants (Should succeed because recruiter created the job)
    res = await request(app)
      .get(`/api/jobs/${jobId}/applicants`)
      .set(headers);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].applicantId._id).toBe(user._id.toString());

    // 7. Update Job
    res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set(headers)
      .send({ ...jobData, title: 'Lead Full Stack Engineer' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.title).toBe('Lead Full Stack Engineer');

    // 8. Delete Job
    res = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set(headers);

    expect(res.statusCode).toEqual(200);

    const job = await Job.findById(jobId);
    expect(job).toBeNull();
  });
});
