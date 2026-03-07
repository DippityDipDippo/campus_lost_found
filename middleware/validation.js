const { body, validationResult } = require('express-validator');
const xss = require('xss');

// Sanitize a string using xss library
const sanitizeStr = (value) => {
  if (typeof value === 'string') return xss(value.trim());
  return value;
};

// Validation rules for creating/updating items
const itemValidationRules = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters')
    .customSanitizer(sanitizeStr),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters')
    .customSanitizer(sanitizeStr),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Lost', 'Found']).withMessage('Category must be Lost or Found'),

  body('location')
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 3, max: 200 }).withMessage('Location must be between 3 and 200 characters')
    .customSanitizer(sanitizeStr),

  body('date_occurred')
    .notEmpty().withMessage('Date is required')
    .isDate().withMessage('Invalid date format')
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (inputDate > today) throw new Error('Date cannot be in the future');
      return true;
    }),

  body('contact_name')
    .notEmpty().withMessage('Contact name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Contact name must be between 2 and 100 characters')
    .customSanitizer(sanitizeStr),

  body('contact_email')
    .notEmpty().withMessage('Contact email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('contact_phone')
    .optional({ checkFalsy: true })
    .matches(/^[0-9\-\+\s]{8,20}$/).withMessage('Invalid phone number format'),
];

const statusValidationRules = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Active', 'Claimed', 'Resolved']).withMessage('Invalid status value'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

module.exports = {
  itemValidationRules,
  statusValidationRules,
  handleValidationErrors,
  sanitizeStr
};
