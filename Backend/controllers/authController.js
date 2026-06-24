const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const authService = require('../services/authService');
const generateToken = require('../utils/generateToken');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.registerUser(name, email, password);
  
  const token = generateToken(res, user._id);

  return apiResponse.success(res, 'User registered successfully', {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  }, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password);

  const token = generateToken(res, user._id);

  return apiResponse.success(res, 'User logged in successfully', {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  });
});

exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return apiResponse.success(res, 'Logged out successfully');
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email, req.protocol, req.get('host'));
  return apiResponse.success(res, 'Reset link sent to your email');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  await authService.resetPassword(token, password);
  return apiResponse.success(res, 'Password reset successfully');
});
