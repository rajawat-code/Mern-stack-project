const User = require('../models/User');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Skill = require('../models/Skill');
const ConnectionRequest = require('../models/ConnectionRequest');
const { uploadBuffer } = require('../config/cloudinary');

const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('skills')
    .populate('education')
    .populate('experience')
    .populate('connections', 'name email headline profilePicture')
    .populate('followers', 'name email headline profilePicture')
    .populate('following', 'name email headline profilePicture');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const updateUserProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  return user;
};

const uploadProfilePicture = async (userId, fileBuffer) => {
  const url = await uploadBuffer(fileBuffer, 'image');
  const user = await User.findByIdAndUpdate(userId, { profilePicture: url }, { new: true });
  return user;
};

const uploadCoverPhoto = async (userId, fileBuffer) => {
  const url = await uploadBuffer(fileBuffer, 'image');
  const user = await User.findByIdAndUpdate(userId, { coverPhoto: url }, { new: true });
  return user;
};

// Experience methods
const addExperience = async (userId, expData) => {
  const experience = await Experience.create({ ...expData, userId });
  await User.findByIdAndUpdate(userId, {
    $push: { experience: experience._id },
  });
  return experience;
};

const updateExperience = async (userId, expId, expData) => {
  const experience = await Experience.findOneAndUpdate(
    { _id: expId, userId },
    expData,
    { new: true, runValidators: true }
  );
  if (!experience) {
    throw new Error('Experience not found or unauthorized');
  }
  return experience;
};

const deleteExperience = async (userId, expId) => {
  const experience = await Experience.findOneAndDelete({ _id: expId, userId });
  if (!experience) {
    throw new Error('Experience not found or unauthorized');
  }
  await User.findByIdAndUpdate(userId, {
    $pull: { experience: expId },
  });
  return experience;
};

// Education methods
const addEducation = async (userId, eduData) => {
  const education = await Education.create({ ...eduData, userId });
  await User.findByIdAndUpdate(userId, {
    $push: { education: education._id },
  });
  return education;
};

const updateEducation = async (userId, eduId, eduData) => {
  const education = await Education.findOneAndUpdate(
    { _id: eduId, userId },
    eduData,
    { new: true, runValidators: true }
  );
  if (!education) {
    throw new Error('Education not found or unauthorized');
  }
  return education;
};

const deleteEducation = async (userId, eduId) => {
  const education = await Education.findOneAndDelete({ _id: eduId, userId });
  if (!education) {
    throw new Error('Education not found or unauthorized');
  }
  await User.findByIdAndUpdate(userId, {
    $pull: { education: eduId },
  });
  return education;
};

// Skills methods
const addSkill = async (userId, skillName) => {
  // Check duplicate skill name for the same user
  let skill = await Skill.findOne({ userId, skillName: { $regex: new RegExp(`^${skillName}$`, 'i') } });
  if (skill) {
    throw new Error('Skill already exists for this user');
  }

  skill = await Skill.create({ userId, skillName });
  await User.findByIdAndUpdate(userId, {
    $push: { skills: skill._id },
  });
  return skill;
};

const removeSkill = async (userId, skillId) => {
  const skill = await Skill.findOneAndDelete({ _id: skillId, userId });
  if (!skill) {
    throw new Error('Skill not found or unauthorized');
  }
  await User.findByIdAndUpdate(userId, {
    $pull: { skills: skillId },
  });
  return skill;
};

const endorseSkill = async (userId, targetSkillId) => {
  const skill = await Skill.findById(targetSkillId);
  if (!skill) {
    throw new Error('Skill not found');
  }

  if (skill.userId.toString() === userId.toString()) {
    throw new Error('You cannot endorse your own skill');
  }

  const alreadyEndorsed = skill.endorsedBy.includes(userId);
  if (alreadyEndorsed) {
    // Remove endorsement (toggle behavior)
    skill.endorsedBy = skill.endorsedBy.filter((id) => id.toString() !== userId.toString());
  } else {
    // Add endorsement
    skill.endorsedBy.push(userId);
  }

  skill.endorsementCount = skill.endorsedBy.length;
  await skill.save();
  return skill;
};

// Connection request methods
const sendConnectionRequest = async (senderId, receiverId) => {
  if (senderId.toString() === receiverId.toString()) {
    throw new Error('You cannot send a connection request to yourself');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new Error('Receiver not found');
  }

  // Check if they are already connected
  const sender = await User.findById(senderId);
  if (sender.connections.includes(receiverId)) {
    throw new Error('You are already connected to this user');
  }

  // Check existing pending request (either way)
  const existingRequest = await ConnectionRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId, status: 'pending' },
      { sender: receiverId, receiver: senderId, status: 'pending' },
    ],
  });

  if (existingRequest) {
    throw new Error('A connection request is already pending between you');
  }

  const request = await ConnectionRequest.create({
    sender: senderId,
    receiver: receiverId,
    status: 'pending',
  });

  return request;
};

const acceptConnectionRequest = async (receiverId, requestId) => {
  const request = await ConnectionRequest.findOne({ _id: requestId, receiver: receiverId, status: 'pending' });
  if (!request) {
    throw new Error('Connection request not found or not pending');
  }

  request.status = 'accepted';
  await request.save();

  // Add to connections, followers, following
  await User.findByIdAndUpdate(request.sender, {
    $addToSet: { connections: request.receiver, followers: request.receiver, following: request.receiver },
  });

  await User.findByIdAndUpdate(request.receiver, {
    $addToSet: { connections: request.sender, followers: request.sender, following: request.sender },
  });

  return request;
};

const rejectConnectionRequest = async (receiverId, requestId) => {
  const request = await ConnectionRequest.findOne({ _id: requestId, receiver: receiverId, status: 'pending' });
  if (!request) {
    throw new Error('Connection request not found or not pending');
  }

  request.status = 'rejected';
  await request.save();
  return request;
};

const removeConnection = async (userId, connectionId) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { connections: connectionId, followers: connectionId, following: connectionId },
  });

  await User.findByIdAndUpdate(connectionId, {
    $pull: { connections: userId, followers: userId, following: userId },
  });
};

const getPendingRequests = async (userId) => {
  return await ConnectionRequest.find({ receiver: userId, status: 'pending' })
    .populate('sender', 'name email headline profilePicture');
};

const getConnectionsList = async (userId) => {
  const user = await User.findById(userId).populate('connections', 'name email headline profilePicture');
  if (!user) {
    throw new Error('User not found');
  }
  return user.connections;
};

const searchUsers = async (q) => {
  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { headline: { $regex: q, $options: 'i' } },
        ],
      }
    : {};
  return await User.find(filter).select('name email headline profilePicture').limit(20);
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addSkill,
  removeSkill,
  endorseSkill,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getPendingRequests,
  getConnectionsList,
  searchUsers,
};


