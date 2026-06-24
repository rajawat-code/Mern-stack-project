const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Skill = require('../models/Skill');
const generateToken = require('../utils/generateToken');

// Mock Cloudinary uploads
jest.mock('../config/cloudinary', () => ({
  uploadBuffer: jest.fn().mockResolvedValue('https://res.cloudinary.com/mock-image-url.jpg'),
  cloudinary: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

describe('User & Profile API Endpoints', () => {
  let user, token, headers;

  beforeEach(async () => {
    user = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123!',
    });
    
    // Generate token and set authorization headers
    const mockRes = {
      cookie: jest.fn(),
    };
    token = generateToken(mockRes, user._id);
    headers = {
      'Authorization': `Bearer ${token}`,
    };
  });

  describe('GET /api/users/profile', () => {
    it('should retrieve currently logged-in user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set(headers);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
    });

    it('should fail profile retrieval if not authenticated', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update profile information successfully', async () => {
      const updates = {
        name: 'Jane Smith',
        headline: 'Senior Software Engineer',
        about: 'Passionate developer.',
        location: 'San Francisco, CA',
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set(headers)
        .send(updates);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updates.name);
      expect(res.body.data.headline).toBe(updates.headline);
    });
  });

  describe('GET /api/users/profile/:id', () => {
    it('should retrieve specific user profile by ID', async () => {
      const otherUser = await User.create({
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'Password123!',
      });

      const res = await request(app)
        .get(`/api/users/profile/${otherUser._id}`)
        .set(headers);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(otherUser.email);
    });
  });

  describe('GET /api/users/search', () => {
    it('should search for users by name', async () => {
      await User.create({
        name: 'John Miller',
        email: 'johnm@example.com',
        password: 'Password123!',
      });

      const res = await request(app)
        .get('/api/users/search?q=Miller')
        .set(headers);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toContain('John Miller');
    });
  });

  describe('POST /api/users/profile-photo & cover-photo', () => {
    it('should upload profile picture', async () => {
      const buffer = Buffer.from('mock image binary data');
      const res = await request(app)
        .post('/api/users/profile-photo')
        .set(headers)
        .attach('image', buffer, 'profile.jpg');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profilePicture).toBe('https://res.cloudinary.com/mock-image-url.jpg');
    });

    it('should upload cover photo', async () => {
      const buffer = Buffer.from('mock image binary data');
      const res = await request(app)
        .post('/api/users/cover-photo')
        .set(headers)
        .attach('image', buffer, 'cover.jpg');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coverPhoto).toBe('https://res.cloudinary.com/mock-image-url.jpg');
    });
  });

  describe('Experience Routes', () => {
    const experienceData = {
      companyName: 'Tech Corp',
      designation: 'Software Developer',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      currentCompany: false,
      description: 'Worked on web apps',
    };

    it('should add, update, and delete experience', async () => {
      // Add Experience
      let res = await request(app)
        .post('/api/users/experience')
        .set(headers)
        .send(experienceData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.companyName).toBe(experienceData.companyName);
      const expId = res.body.data._id;

      // Update Experience
      res = await request(app)
        .put(`/api/users/experience/${expId}`)
        .set(headers)
        .send({ ...experienceData, companyName: 'New Tech Corp' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.companyName).toBe('New Tech Corp');

      // Delete Experience
      res = await request(app)
        .delete(`/api/users/experience/${expId}`)
        .set(headers);

      expect(res.statusCode).toEqual(200);

      // Verify removal
      const exp = await Experience.findById(expId);
      expect(exp).toBeNull();
    });
  });

  describe('Education Routes', () => {
    const educationData = {
      collegeName: 'State University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2019-09-01',
      endDate: '2023-06-01',
      grade: '3.8',
      description: 'Focused on algorithms',
    };

    it('should add, update, and delete education', async () => {
      // Add Education
      let res = await request(app)
        .post('/api/users/education')
        .set(headers)
        .send(educationData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.collegeName).toBe(educationData.collegeName);
      const eduId = res.body.data._id;

      // Update Education
      res = await request(app)
        .put(`/api/users/education/${eduId}`)
        .set(headers)
        .send({ ...educationData, collegeName: 'Elite University' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.collegeName).toBe('Elite University');

      // Delete Education
      res = await request(app)
        .delete(`/api/users/education/${eduId}`)
        .set(headers);

      expect(res.statusCode).toEqual(200);

      // Verify removal
      const edu = await Education.findById(eduId);
      expect(edu).toBeNull();
    });
  });

  describe('Skills Routes', () => {
    it('should add, remove, and endorse skills', async () => {
      // Add Skill
      let res = await request(app)
        .post('/api/users/skills')
        .set(headers)
        .send({ skillName: 'JavaScript' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.skillName).toBe('JavaScript');
      const skillId = res.body.data._id;

      // Endorse Skill (Should fail when endorsing own skill)
      res = await request(app)
        .post(`/api/users/skills/${skillId}/endorse`)
        .set(headers);

      expect(res.statusCode).toEqual(400); // 400 or 500 mapped depending on error response mapping
      
      // Remove Skill
      res = await request(app)
        .delete(`/api/users/skills/${skillId}`)
        .set(headers);

      expect(res.statusCode).toEqual(200);

      // Verify removal
      const skill = await Skill.findById(skillId);
      expect(skill).toBeNull();
    });

    it('should allow another user to endorse the skill', async () => {
      // Add Skill for Jane Doe
      let skillRes = await request(app)
        .post('/api/users/skills')
        .set(headers)
        .send({ skillName: 'Python' });

      const skillId = skillRes.body.data._id;

      // Create Another User (Bob)
      const bob = await User.create({
        name: 'Bob Smith',
        email: 'bobsmith@example.com',
        password: 'Password123!',
      });
      const mockRes = { cookie: jest.fn() };
      const bobToken = generateToken(mockRes, bob._id);
      const bobHeaders = { 'Authorization': `Bearer ${bobToken}` };

      // Bob endorses Jane's skill
      const res = await request(app)
        .post(`/api/users/skills/${skillId}/endorse`)
        .set(bobHeaders);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.endorsementCount).toBe(1);
      expect(res.body.data.endorsedBy).toContain(bob._id.toString());
    });
  });
});
