const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SavedPost = require('../models/SavedPost');
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

describe('Posts & Comments API Endpoints', () => {
  let user, token, headers;

  beforeEach(async () => {
    user = await User.create({
      name: 'Post Tester',
      email: 'posttester@example.com',
      password: 'Password123!',
    });

    const mockRes = { cookie: jest.fn() };
    token = generateToken(mockRes, user._id);
    headers = {
      'Authorization': `Bearer ${token}`,
    };
  });

  describe('POST /api/posts', () => {
    it('should create a new post with text content', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set(headers)
        .send({ content: 'Hello World! This is my first test post.' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Hello World! This is my first test post.');
    });

    it('should create a post with an uploaded image', async () => {
      const buffer = Buffer.from('mock image binary');
      const res = await request(app)
        .post('/api/posts')
        .set(headers)
        .field('content', 'Post with an image')
        .attach('image', buffer, 'post.jpg');

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.image).toBe('https://res.cloudinary.com/mock-image-url.jpg');
    });
  });

  describe('GET /api/posts/feed', () => {
    it('should retrieve feed containing posts', async () => {
      await Post.create({
        author: user._id,
        content: 'Feed Post 1',
      });

      const res = await request(app)
        .get('/api/posts/feed')
        .set(headers);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update the post content successfully', async () => {
      const post = await Post.create({
        author: user._id,
        content: 'Original Content',
      });

      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .set(headers)
        .send({ content: 'Updated Content' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.content).toBe('Updated Content');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      const post = await Post.create({
        author: user._id,
        content: 'Delete me',
      });

      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set(headers);

      expect(res.statusCode).toEqual(200);
      
      const foundPost = await Post.findById(post._id);
      expect(foundPost).toBeNull();
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should toggle like on a post', async () => {
      const post = await Post.create({
        author: user._id,
        content: 'Like target post',
      });

      // Like
      let res = await request(app)
        .post(`/api/posts/${post._id}/like`)
        .set(headers);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.likes.length).toBe(1);

      // Unlike
      res = await request(app)
        .post(`/api/posts/${post._id}/like`)
        .set(headers);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.likes.length).toBe(0);
    });
  });

  describe('POST & DELETE /api/posts/:id/save', () => {
    it('should save and unsave a post', async () => {
      const post = await Post.create({
        author: user._id,
        content: 'Save target post',
      });

      // Save post
      let res = await request(app)
        .post(`/api/posts/${post._id}/save`)
        .set(headers);

      expect(res.statusCode).toEqual(201);

      // Get saved posts list
      res = await request(app)
        .get('/api/posts/saved')
        .set(headers);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]._id).toBe(post._id.toString());

      // Unsave post
      res = await request(app)
        .delete(`/api/posts/${post._id}/save`)
        .set(headers);

      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Comments API Endpoints', () => {
    let post;

    beforeEach(async () => {
      post = await Post.create({
        author: user._id,
        content: 'Comment target post',
      });
    });

    it('should add, edit, and delete a comment on a post', async () => {
      // Add Comment
      let res = await request(app)
        .post(`/api/comments/${post._id}`)
        .set(headers)
        .send({ commentText: 'This is a test comment.' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.commentText).toBe('This is a test comment.');
      const commentId = res.body.data._id;

      // Edit Comment
      res = await request(app)
        .put(`/api/comments/${commentId}`)
        .set(headers)
        .send({ commentText: 'This is an edited comment.' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.commentText).toBe('This is an edited comment.');

      // Delete Comment
      res = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set(headers);

      expect(res.statusCode).toEqual(200);

      const comment = await Comment.findById(commentId);
      expect(comment).toBeNull();
    });
  });
});
