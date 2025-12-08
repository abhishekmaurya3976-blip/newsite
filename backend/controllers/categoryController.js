const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const slugify = require('slugify');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to build category tree
const buildCategoryTree = (categories, parentId = null) => {
  const tree = [];
  
  categories
    .filter(category => {
      const categoryParentId = category.parentId ? category.parentId.toString() : null;
      return categoryParentId === parentId;
    })
    .forEach(category => {
      const children = buildCategoryTree(categories, category._id.toString());
      
      const categoryObj = category.toObject ? category.toObject() : category;
      categoryObj.id = categoryObj._id.toString();
      
      if (children.length > 0) {
        categoryObj.children = children;
      }
      
      tree.push(categoryObj);
    });
  
  return tree;
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAll = asyncHandler(async (req, res) => {
  const { isActive, populate } = req.query;
  
  let query = Category.find();
  
  // Filter by active status if provided
  if (isActive !== undefined) {
    query = query.where('isActive', isActive === 'true');
  }
  
  const categories = await query.sort({ name: 1 }).lean();
  
  // Convert _id to id for frontend consistency
  const categoriesWithId = categories.map(category => ({
    ...category,
    id: category._id.toString(),
    parentId: category.parentId ? category.parentId.toString() : null
  }));
  
  res.status(200).json({
    success: true,
    data: categoriesWithId,
    count: categoriesWithId.length
  });
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
exports.getTree = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ name: 1 })
    .lean();
  
  // Convert _id to id and parentId to string for tree building
  const categoriesWithIds = categories.map(category => ({
    ...category,
    id: category._id.toString(),
    parentId: category.parentId ? category.parentId.toString() : null
  }));
  
  const tree = buildCategoryTree(categoriesWithIds);
  
  res.status(200).json({
    success: true,
    data: tree,
    count: tree.length
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID format'
    });
  }
  
  const category = await Category.findById(id).lean();
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Convert _id to id
  const categoryWithId = {
    ...category,
    id: category._id.toString(),
    parentId: category.parentId ? category.parentId.toString() : null
  };
  
  res.status(200).json({
    success: true,
    data: categoryWithId
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Convert _id to id
  const categoryWithId = {
    ...category,
    id: category._id.toString(),
    parentId: category.parentId ? category.parentId.toString() : null
  };
  
  res.status(200).json({
    success: true,
    data: categoryWithId
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Public (Temporarily)
exports.create = asyncHandler(async (req, res) => {
  const { name, description, parentId, isActive = true } = req.body;
  
  // Check if category with same name exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category with this name already exists'
    });
  }
  
  // Validate parent category if provided and not empty
  let parentCategory = null;
  if (parentId && parentId.trim() !== '') {
    // Check if parentId is valid ObjectId
    if (!isValidObjectId(parentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parent category ID format'
      });
    }
    
    parentCategory = await Category.findById(parentId);
    if (!parentCategory) {
      return res.status(400).json({
        success: false,
        message: 'Parent category not found'
      });
    }
  }
  
  // Generate slug
  const slug = slugify(name, { 
    lower: true, 
    strict: true, 
    trim: true,
    remove: /[*+~.()'"!:@]/g 
  });
  
  // Prepare category data
  const categoryData = {
    name,
    slug,
    description: description || '',
    parentId: (parentId && parentId.trim() !== '' && isValidObjectId(parentId)) ? parentId : null,
    isActive: isActive === 'true' || isActive === true
  };
  
  // Handle image upload if file exists
  if (req.file) {
    // Convert buffer to base64 for now
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    categoryData.image = {
      url: `data:${mimeType};base64,${base64Image}`,
      publicId: `category-${Date.now()}`,
      altText: name
    };
  }
  
  const category = await Category.create(categoryData);
  
  // Convert _id to id for response
  const createdCategory = {
    ...category.toObject(),
    id: category._id.toString(),
    parentId: category.parentId ? category.parentId.toString() : null
  };
  
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: createdCategory
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public (Temporarily)
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID format'
    });
  }
  
  const category = await Category.findById(id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Check if updating name causes duplicate
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({ 
      name: req.body.name,
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
  }
  
  // Prepare update data
  const updateData = {};
  
  // Only update fields that are provided
  if (req.body.name !== undefined) updateData.name = req.body.name;
  if (req.body.description !== undefined) updateData.description = req.body.description;
  if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
  
  // Handle parentId - validate if provided
  if (req.body.parentId !== undefined) {
    if (req.body.parentId && req.body.parentId.trim() !== '') {
      // Check if parentId is valid ObjectId
      if (!isValidObjectId(req.body.parentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent category ID format'
        });
      }
      
      // Check if parent exists
      const parentCategory = await Category.findById(req.body.parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      
      // Prevent circular reference (category can't be its own parent)
      if (req.body.parentId === id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }
      
      updateData.parentId = req.body.parentId;
    } else {
      updateData.parentId = null;
    }
  }
  
  // Handle image upload if file exists
  if (req.file) {
    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    updateData.image = {
      url: `data:${mimeType};base64,${base64Image}`,
      publicId: `category-${Date.now()}`,
      altText: req.body.name || category.name
    };
  } else if (req.body.image === null || req.body.image === '') {
    // If image is null or empty string, remove the image
    updateData.image = undefined;
  }
  
  // Update category
  Object.keys(updateData).forEach(key => {
    if (key !== 'slug') { // Don't allow direct slug updates
      category[key] = updateData[key];
    }
  });
  
  // Regenerate slug if name changed
  if (req.body.name) {
    category.slug = slugify(req.body.name, { 
      lower: true, 
      strict: true, 
      trim: true,
      remove: /[*+~.()'"!:@]/g 
    });
  }
  
  await category.save();
  
  // Convert _id to id for response
  const updatedCategory = {
    ...category.toObject(),
    id: category._id.toString(),
    parentId: category.parentId ? category.parentId.toString() : null
  };
  
  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Public (Temporarily)
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID format'
    });
  }
  
  const category = await Category.findById(id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Check if category has children
  const childCount = await Category.countDocuments({ parentId: category._id });
  if (childCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category that has subcategories. Please delete subcategories first.'
    });
  }
  
  await category.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: {
      id: category._id.toString(),
      name: category.name
    }
  });
});