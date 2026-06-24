const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const crypto = require('crypto');

// Mock sendEmail utility to avoid actual email transmission
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

describe('Auth API Endpoints', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data).toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should not register user with duplicate email', async () => {
      // First registration
      await User.create(testUser);

      // Duplicate registration attempt
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail registration with invalid input validation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create(testUser);
    });

    it('should login user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user and clear cookie', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie'][0]).toContain('token=;');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should initiate forgot-password process successfully', async () => {
      await User.create(testUser);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      
      const user = await User.findOne({ email: testUser.email });
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpire).toBeDefined();
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    let resetToken;
    let hashedToken;

    beforeEach(async () => {
      resetToken = crypto.randomBytes(20).toString('hex');
      hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      await User.create({
        ...testUser,
        resetPasswordToken: hashedToken,
        resetPasswordExpire: Date.now() + 10 * 60 * 1000,
      });
    });

    it('should reset password successfully', async () => {
      const res = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: 'NewPassword123!' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // Verify that user can login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'NewPassword123!',
        });
      expect(loginRes.statusCode).toEqual(200);
    });

    it('should fail reset-password with invalid/expired token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/invalidtoken')
        .send({ password: 'NewPassword123!' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});
