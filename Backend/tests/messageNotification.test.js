const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { createNotification } = require('../controllers/notificationController');
const generateToken = require('../utils/generateToken');

describe('Messaging & Notifications API Endpoints', () => {
  let userA, userB, tokenA, tokenB, headersA, headersB;

  beforeEach(async () => {
    userA = await User.create({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123!',
    });
    const mockResA = { cookie: jest.fn() };
    tokenA = generateToken(mockResA, userA._id);
    headersA = { 'Authorization': `Bearer ${tokenA}` };

    userB = await User.create({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123!',
    });
    const mockResB = { cookie: jest.fn() };
    tokenB = generateToken(mockResB, userB._id);
    headersB = { 'Authorization': `Bearer ${tokenB}` };
  });

  describe('Messaging APIs', () => {
    it('should send messages, list conversations, list messages, and mark seen', async () => {
      // 1. Send Message from User A to User B
      let res = await request(app)
        .post('/api/messages/send')
        .set(headersA)
        .send({
          receiverId: userB._id.toString(),
          content: 'Hello User B!',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Hello User B!');
      const conversationId = res.body.data.conversationId;

      // 2. Get Conversations for User A
      res = await request(app)
        .get('/api/messages/conversations')
        .set(headersA);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]._id).toBe(conversationId);

      // 3. Get Messages in the Conversation
      res = await request(app)
        .get(`/api/messages/conversation/${conversationId}`)
        .set(headersA);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].content).toBe('Hello User B!');

      // 4. Mark messages as seen by User B
      res = await request(app)
        .put(`/api/messages/seen/${conversationId}`)
        .set(headersB);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Notifications APIs', () => {
    it('should retrieve, mark read, mark all read, and clear notifications', async () => {
      // 1. Manually create a notification for User B
      const notification = await createNotification(
        userB._id,
        userA._id,
        'like',
        'User A liked your post'
      );

      expect(notification).toBeDefined();
      expect(notification.message).toBe('User A liked your post');

      // 2. Get notifications for User B
      let res = await request(app)
        .get('/api/notifications')
        .set(headersB);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const notificationId = res.body.data[0]._id;

      // 3. Mark single notification as read
      res = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set(headersB);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.isRead).toBe(true);

      // Create another notification to test mark all read
      await createNotification(
        userB._id,
        userA._id,
        'comment',
        'User A commented on your post'
      );

      // 4. Mark all as read
      res = await request(app)
        .put('/api/notifications/mark-all-read')
        .set(headersB);

      expect(res.statusCode).toEqual(200);

      // 5. Clear all notifications
      res = await request(app)
        .delete('/api/notifications')
        .set(headersB);

      expect(res.statusCode).toEqual(200);

      // Verify empty list
      res = await request(app)
        .get('/api/notifications')
        .set(headersB);

      expect(res.body.data.length).toBe(0);
    });
  });
});
