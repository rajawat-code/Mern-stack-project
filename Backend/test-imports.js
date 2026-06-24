try {
  console.log('Verifying packages & configuration loaders...');
  require('./config/db');
  require('./config/cloudinary');
  require('./config/socket');
  
  console.log('Verifying Models...');
  require('./models/User');
  require('./models/Post');
  require('./models/Comment');
  require('./models/ConnectionRequest');
  require('./models/Message');
  require('./models/Conversation');
  require('./models/Notification');
  require('./models/Experience');
  require('./models/Education');
  require('./models/Skill');
  require('./models/Company');
  require('./models/Job');
  require('./models/Application');
  require('./models/SavedPost');

  console.log('Verifying Services...');
  require('./services/authService');
  require('./services/userService');
  require('./services/postService');
  require('./services/jobService');

  console.log('Verifying Controllers...');
  require('./controllers/authController');
  require('./controllers/userController');
  require('./controllers/postController');
  require('./controllers/commentController');
  require('./controllers/connectionController');
  require('./controllers/messageController');
  require('./controllers/notificationController');
  require('./controllers/companyController');
  require('./controllers/jobController');

  console.log('Verifying Express App initialization...');
  require('./app');

  console.log('✅ ALL IMPORTS AND SYNTAX CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
} catch (error) {
  console.error('❌ SYNTAX/IMPORT CHECK FAILED:');
  console.error(error);
  process.exit(1);
}
