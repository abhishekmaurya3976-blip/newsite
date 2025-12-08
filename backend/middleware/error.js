// middlewares/error.js
exports.notFound = (req, res, next) => {
  res.status(404);
  const err = new Error(`Not Found - ${req.originalUrl}`);
  next(err);
};

exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🍃' : err.stack,
    data: err.data || null,
  });
};
