const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Experience = require('./models/Experience');
const Education = require('./models/Education');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Application = require('./models/Application');
const ConnectionRequest = require('./models/ConnectionRequest');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const SavedPost = require('./models/SavedPost');
const Skill = require('./models/Skill');

// Connect to DB
const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/linkedin_clone';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing old database records...');
    await User.deleteMany();
    await Experience.deleteMany();
    await Education.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    await Application.deleteMany();
    await ConnectionRequest.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();
    await Notification.deleteMany();
    await SavedPost.deleteMany();
    await Skill.deleteMany();
    console.log('Database cleared.');

    // --- SEED USERS (without skills first) ---
    console.log('Seeding users...');
    
    const user1 = await User.create({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'password123',
      headline: 'Senior Software Engineer at Google | React & Node.js Expert',
      about: 'Passionate software developer with 8+ years of experience building scalable web applications. Love to solve complex problems and mentor junior devs.',
      location: 'Mountain View, CA',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
      skills: []
    });

    const user2 = await User.create({
      name: 'Bob Jones',
      email: 'bob@example.com',
      password: 'password123',
      headline: 'Product Manager at Meta | Ex-Microsoft',
      about: 'Experienced PM leading cross-functional teams to deliver user-centric products. Specialize in growth engineering and mobile platforms.',
      location: 'Menlo Park, CA',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      skills: []
    });

    const user3 = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'password123',
      headline: 'Data Scientist at Netflix',
      about: 'Deep learning researcher and big data enthusiast. Using machine learning to personalize user experiences and recommend titles.',
      location: 'Los Gatos, CA',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
      skills: []
    });

    console.log('Users seeded successfully.');

    // Establish connections/followers
    user1.connections.push(user2._id);
    user1.followers.push(user2._id);
    user1.following.push(user2._id);

    user2.connections.push(user1._id);
    user2.followers.push(user1._id);
    user2.following.push(user1._id);

    await user1.save();
    await user2.save();

    // --- SEED SKILLS (linking to users) ---
    console.log('Seeding skills for users...');
    
    // Alice's skills
    const skillA1 = await Skill.create({ userId: user1._id, skillName: 'JavaScript' });
    const skillA2 = await Skill.create({ userId: user1._id, skillName: 'Node.js' });
    const skillA3 = await Skill.create({ userId: user1._id, skillName: 'React' });
    
    // Bob's skills
    const skillB1 = await Skill.create({ userId: user2._id, skillName: 'Product Management' });
    const skillB2 = await Skill.create({ userId: user2._id, skillName: 'System Design' });

    // Charlie's skills
    const skillC1 = await Skill.create({ userId: user3._id, skillName: 'Python' });

    // Link skills back to users
    user1.skills.push(skillA1._id, skillA2._id, skillA3._id);
    user2.skills.push(skillB1._id, skillB2._id);
    user3.skills.push(skillC1._id);

    await user1.save();
    await user2.save();
    await user3.save();

    console.log('Skills linked to users.');

    // --- SEED EXPERIENCE ---
    console.log('Seeding experiences...');
    const exp1 = await Experience.create({
      userId: user1._id,
      companyName: 'Google',
      designation: 'Senior Software Engineer',
      startDate: new Date('2021-06-01'),
      description: 'Tech lead for Google Cloud Frontend console. Scaled systems and reduced page load times by 40%.',
      currentCompany: true
    });

    const exp2 = await Experience.create({
      userId: user1._id,
      companyName: 'Amazon',
      designation: 'Software Engineer',
      startDate: new Date('2018-05-01'),
      endDate: new Date('2021-05-30'),
      description: 'Worked on AWS Lambda orchestration layer. Collaborated on zero-downtime deployment features.'
    });

    const exp3 = await Experience.create({
      userId: user2._id,
      companyName: 'Meta',
      designation: 'Product Manager',
      startDate: new Date('2022-01-10'),
      description: 'Managing Instagram Reels Growth team. Drove user engagement up by 15% through design optimizations.',
      currentCompany: true
    });

    // Link experiences back to users
    user1.experience.push(exp1._id, exp2._id);
    user2.experience.push(exp3._id);
    await user1.save();
    await user2.save();
    console.log('Experiences seeded.');

    // --- SEED EDUCATION ---
    console.log('Seeding education...');
    const edu1 = await Education.create({
      userId: user1._id,
      collegeName: 'Stanford University',
      degree: 'Master of Science',
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2016-09-01'),
      endDate: new Date('2018-06-01'),
      grade: 'A',
      description: 'Specialization in Software Engineering and Distributed Systems.'
    });

    const edu2 = await Education.create({
      userId: user2._id,
      collegeName: 'UC Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Electrical Engineering and Computer Science',
      startDate: new Date('2012-09-01'),
      endDate: new Date('2016-05-30'),
      grade: '3.8 GPA'
    });

    user1.education.push(edu1._id);
    user2.education.push(edu2._id);
    await user1.save();
    await user2.save();
    console.log('Education records seeded.');

    // --- SEED COMPANIES ---
    console.log('Seeding companies...');
    const comp1 = await Company.create({
      name: 'Google LLC',
      logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=150',
      description: 'Organizing the worlds information and making it universally accessible and useful.',
      industry: 'Technology',
      website: 'https://google.com',
      createdBy: user1._id
    });

    const comp2 = await Company.create({
      name: 'Meta Platforms Inc.',
      logo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150',
      description: 'Giving people the power to build community and bring the world closer together.',
      industry: 'Internet & Social Media',
      website: 'https://meta.com',
      createdBy: user2._id
    });

    console.log('Companies seeded.');

    // --- SEED JOBS ---
    console.log('Seeding jobs...');
    const job1 = await Job.create({
      title: 'Senior React Developer',
      description: 'We are looking for a Senior React Developer to join our Cloud Platform UI team. Experience in TypeScript, Next.js, and state management required.',
      location: 'Mountain View, CA (Hybrid)',
      salary: '$150,000 - $180,000',
      skillsRequired: ['React', 'JavaScript', 'TypeScript', 'Redux'],
      company: comp1._id,
      postedBy: user1._id
    });

    const job2 = await Job.create({
      title: 'Technical Product Manager',
      description: 'Lead the next generation of developer API platform. Prior coding experience and 3+ years PM experience required.',
      location: 'Menlo Park, CA (Onsite)',
      salary: '$160,000 - $200,000',
      skillsRequired: ['Product Management', 'SQL', 'System Design'],
      company: comp2._id,
      postedBy: user2._id
    });

    console.log('Jobs seeded.');

    // --- SEED APPLICATIONS ---
    console.log('Seeding applications...');
    await Application.create({
      jobId: job1._id,
      applicantId: user2._id,
      status: 'applied',
      resume: 'https://example.com/bobjones_resume.pdf'
    });
    console.log('Job application seeded.');

    // --- SEED POSTS & COMMENTS ---
    console.log('Seeding posts and comments...');
    const post1 = await Post.create({
      author: user1._id,
      content: 'Excited to announce that I have joined the Google Cloud frontend team! Looking forward to working with amazing people and scaling developer consoles worldwide. 🚀',
      likes: [user2._id, user3._id]
    });

    const post2 = await Post.create({
      author: user2._id,
      content: 'What makes a great product manager? In my experience, it boils down to three things: empathy for the user, clear documentation, and ruthless prioritization. What do you think?',
      likes: [user1._id]
    });

    const comment1 = await Comment.create({
      postId: post1._id,
      userId: user2._id,
      commentText: 'Congratulations Alice! Well deserved. Let\'s catch up soon.'
    });

    const comment2 = await Comment.create({
      postId: post2._id,
      userId: user1._id,
      commentText: 'Agreed, especially on ruthless prioritization! It is too easy to get distracted by noise.'
    });

    post1.comments.push(comment1._id);
    post2.comments.push(comment2._id);
    await post1.save();
    await post2.save();

    console.log('Posts and Comments seeded.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
