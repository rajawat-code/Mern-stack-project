const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const ConnectionRequest = require('../models/ConnectionRequest');
const generateToken = require('../utils/generateToken');

describe('Connections API Endpoints', () => {
  let userA, userB, tokenA, tokenB, headersA, headersB;

  beforeEach(async () => {
    // User A
    userA = await User.create({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123!',
    });
    const mockResA = { cookie: jest.fn() };
    tokenA = generateToken(mockResA, userA._id);
    headersA = { 'Authorization': `Bearer ${tokenA}` };

    // User B
    userB = await User.create({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123!',
    });
    const mockResB = { cookie: jest.fn() };
    tokenB = generateToken(mockResB, userB._id);
    headersB = { 'Authorization': `Bearer ${tokenB}` };
  });

  it('should send, view pending, and accept connection request', async () => {
    // 1. Send Request from User A to User B
    let res = await request(app)
      .post('/api/connections/request')
      .set(headersA)
      .send({ recipientId: userB._id.toString() });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    const requestId = res.body.data._id;

    // 2. View Pending Requests for User B
    res = await request(app)
      .get('/api/connections/pending')
      .set(headersB);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]._id).toBe(requestId);

    // 3. Accept Request by User B
    res = await request(app)
      .put(`/api/connections/request/${requestId}/accept`)
      .set(headersB);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.status).toBe('accepted');

    // 4. Check Connections for User A
    res = await request(app)
      .get('/api/connections')
      .set(headersA);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]._id).toBe(userB._id.toString());

    // 5. Remove Connection
    res = await request(app)
      .delete(`/api/connections/${userB._id}`)
      .set(headersA);

    expect(res.statusCode).toEqual(200);

    // Verify removed
    const updatedUserA = await User.findById(userA._id);
    expect(updatedUserA.connections.length).toBe(0);
  });

  it('should reject connection request', async () => {
    // Send Request from User A to User B
    let res = await request(app)
      .post('/api/connections/request')
      .set(headersA)
      .send({ recipientId: userB._id.toString() });

    const requestId = res.body.data._id;

    // Reject Request by User B
    res = await request(app)
      .put(`/api/connections/request/${requestId}/reject`)
      .set(headersB);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.status).toBe('rejected');
  });
});
