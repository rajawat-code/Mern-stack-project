const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { getIO } = require('../config/socket');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user._id;

  if (senderId.toString() === receiverId.toString()) {
    res.status(400);
    throw new Error('You cannot send a message to yourself');
  }

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  // Create message
  const message = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content,
  });

  // Update last message in conversation
  conversation.lastMessage = message._id;
  await conversation.save();

  // Send real-time notification/message via Socket.io
  try {
    const io = getIO();
    io.to(receiverId.toString()).emit('message_received', {
      message,
      senderName: req.user.name,
      senderProfilePicture: req.user.profilePicture,
    });
  } catch (error) {
    console.log('Socket.io error emitting message:', error.message);
  }

  return apiResponse.success(res, 'Message sent successfully', message, 201);
});

exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name email headline profilePicture')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  return apiResponse.success(res, 'Conversations retrieved successfully', conversations);
});

exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  // Verify participation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    res.status(403);
    throw new Error('You are not authorized to view this conversation');
  }

  const messages = await Message.find({ conversationId })
    .populate('sender', 'name profilePicture')
    .sort({ createdAt: 1 });

  return apiResponse.success(res, 'Messages retrieved successfully', messages);
});

exports.markSeen = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    res.status(403);
    throw new Error('Conversation not found or unauthorized');
  }

  // Update messages sent by the other participant to 'seen'
  const result = await Message.updateMany(
    { conversationId, receiver: userId, seen: false },
    { $set: { seen: true } }
  );

  // Notify sender of seen status via socket if possible
  try {
    const io = getIO();
    const otherParticipant = conversation.participants.find(
      (id) => id.toString() !== userId.toString()
    );
    if (otherParticipant) {
      io.to(otherParticipant.toString()).emit('messages_marked_seen', {
        conversationId,
        receiverId: userId,
      });
    }
  } catch (error) {
    console.log('Socket.io error marking messages seen:', error.message);
  }

  return apiResponse.success(res, 'Messages marked as seen', { modifiedCount: result.modifiedCount });
});
