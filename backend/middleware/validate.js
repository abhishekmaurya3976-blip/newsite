const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Product validation
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required')
    .isLength({ max: 50 }).withMessage('SKU cannot exceed 50 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean'),
  
  body('isBestSeller')
    .optional()
    .isBoolean().withMessage('isBestSeller must be a boolean'),
  
  validate
];

// Category validation
const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('parent')
    .optional()
    .isMongoId().withMessage('Invalid parent category ID'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  body('showInMenu')
    .optional()
    .isBoolean().withMessage('showInMenu must be a boolean'),
  
  validate
];

// Slider validation
const validateSlider = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  
  body('subtitle')
    .optional()
    .isLength({ max: 200 }).withMessage('Subtitle cannot exceed 200 characters'),
  
  body('buttonText')
    .optional()
    .isLength({ max: 30 }).withMessage('Button text cannot exceed 30 characters'),
  
  body('buttonLink')
    .optional()
    .isURL().withMessage('Button link must be a valid URL'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  body('order')
    .optional()
    .isInt().withMessage('Order must be an integer'),
  
  validate
];

// ID parameter validation
const validateId = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  validate
];

module.exports = {
  validateProduct,
  validateCategory,
  validateSlider,
  validateId,
  validatePagination,
  validate
};