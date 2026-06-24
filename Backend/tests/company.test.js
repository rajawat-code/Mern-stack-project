const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Company = require('../models/Company');
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

describe('Company API Endpoints', () => {
  let user, token, headers;

  beforeEach(async () => {
    user = await User.create({
      name: 'Company Tester',
      email: 'companytester@example.com',
      password: 'Password123!',
    });

    const mockRes = { cookie: jest.fn() };
    token = generateToken(mockRes, user._id);
    headers = { 'Authorization': `Bearer ${token}` };
  });

  it('should create, search, update, and follow a company', async () => {
    // 1. Create Company
    const buffer = Buffer.from('mock logo image data');
    let res = await request(app)
      .post('/api/companies')
      .set(headers)
      .field('name', 'Google')
      .field('description', 'Search Engine giant')
      .field('industry', 'Technology')
      .field('website', 'https://google.com')
      .attach('logo', buffer, 'logo.png');

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Google');
    expect(res.body.data.logo).toBe('https://res.cloudinary.com/mock-image-url.jpg');
    const companyId = res.body.data._id;

    // 2. Search Companies
    res = await request(app)
      .get('/api/companies?q=Google')
      .set(headers);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toBe('Google');

    // 3. Get Company by ID
    res = await request(app)
      .get(`/api/companies/${companyId}`)
      .set(headers);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.name).toBe('Google');

    // 4. Update Company
    res = await request(app)
      .put(`/api/companies/${companyId}`)
      .set(headers)
      .field('name', 'Google Inc')
      .field('description', 'AI and Search Engine giant');

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.name).toBe('Google Inc');

    // 5. Follow / Unfollow Company
    res = await request(app)
      .post(`/api/companies/${companyId}/follow`)
      .set(headers);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.followers.length).toBe(1);

    // Unfollow
    res = await request(app)
      .post(`/api/companies/${companyId}/follow`)
      .set(headers);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.followers.length).toBe(0);
  });
});
