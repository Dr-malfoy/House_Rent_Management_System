const { validationResult } = require('express-validator');
const { unprocessable } = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return unprocessable(res, 'Validation failed. Please check your inputs.', errorList);
  }
  next();
}

module.exports = validate;
