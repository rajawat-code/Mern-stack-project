const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const userService = require('../services/userService');

exports.sendRequest = asyncHandler(async (req, res) => {
  const targetId = req.body.receiverId || req.body.recipientId;
  const request = await userService.sendConnectionRequest(req.user._id, targetId);

  // Notify receiver
  const { createNotification } = require('./notificationController');
  await createNotification(
    targetId,
    req.user._id,
    'connection_request',
    `${req.user.name} sent you a connection request`,
    request._id
  );

  return apiResponse.success(res, 'Connection request sent successfully', request, 201);
});

exports.acceptRequest = asyncHandler(async (req, res) => {
  const request = await userService.acceptConnectionRequest(req.user._id, req.params.id);

  // Notify sender that request was accepted
  const { createNotification } = require('./notificationController');
  await createNotification(
    request.sender,
    req.user._id,
    'connection_request',
    `${req.user.name} accepted your connection request`,
    request._id
  );

  return apiResponse.success(res, 'Connection request accepted successfully', request);
});


exports.rejectRequest = asyncHandler(async (req, res) => {
  const request = await userService.rejectConnectionRequest(req.user._id, req.params.id);
  return apiResponse.success(res, 'Connection request rejected successfully', request);
});

exports.removeConnection = asyncHandler(async (req, res) => {
  await userService.removeConnection(req.user._id, req.params.id);
  return apiResponse.success(res, 'Connection removed successfully');
});

exports.getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await userService.getPendingRequests(req.user._id);
  return apiResponse.success(res, 'Pending connection requests retrieved', requests);
});

exports.getConnections = asyncHandler(async (req, res) => {
  const connections = await userService.getConnectionsList(req.user._id);
  return apiResponse.success(res, 'Connections retrieved successfully', connections);
});
