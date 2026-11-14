const { error } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      data: null,
      errors: [err.message],
    });
  }

  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A duplicate record already exists.',
      data: null,
      errors: [err.sqlMessage || err.message],
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return error(
    res,
    message,
    process.env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode
  );
}

module.exports = errorHandler;
