const apiResponse = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message;

  // Map known service error messages to correct status codes
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('credentials') || lowerMsg.includes('not authorized') || lowerMsg.includes('token failed') || lowerMsg.includes('no token')) {
    statusCode = 401;
  } else if (lowerMsg.includes('already exists') || lowerMsg.includes('cannot') || lowerMsg.includes('invalid') || lowerMsg.includes('required')) {
    statusCode = 400;
  } else if (lowerMsg.includes('no user with that email') || lowerMsg.includes('not found') || lowerMsg.includes('does not exist')) {
    statusCode = 404;
  }

  // Mongoose CastError
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  return apiResponse.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'production' ? null : err.stack
  );
};

module.exports = { notFound, errorHandler };
