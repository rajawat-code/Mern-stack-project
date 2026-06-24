const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { getIO } = require('../config/socket');

// Helper to create notification and broadcast via Socket.io
const createNotification = async (receiver, sender, type, message, entityId = null) => {
  try {
    if (receiver.toString() === sender.toString()) return null;

    const notification = await Notification.create({
      receiver,
      sender,
      type,
      message,
      entityId,
    });

    // Populate sender details for real-time display
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name profilePicture');

    // Emit via Socket.io
    try {
      const io = getIO();
      io.to(receiver.toString()).emit('notification_received', populated);
    } catch (socketErr) {
      console.log('Socket not ready for notification emit:', socketErr.message);
    }

    return notification;
  } catch (error) {
    console.log('Error creating notification:', error.message);
    return null;
  }
};

// Retrieve notifications for logged-in user
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ receiver: req.user._id })
    .populate('sender', 'name profilePicture headline')
    .sort({ createdAt: -1 });

  return apiResponse.success(res, 'Notifications retrieved successfully', notifications);
});

// Mark single notification as read
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, receiver: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  return apiResponse.success(res, 'Notification marked as read', notification);
});

// Mark all as read
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { receiver: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return apiResponse.success(res, 'All notifications marked as read');
});

// Delete all notifications
const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ receiver: req.user._id });
  return apiResponse.success(res, 'Notifications cleared successfully');
});

module.exports = {
  createNotification,
  getNotifications,
  markRead,
  markAllRead,
  clearNotifications,
};
