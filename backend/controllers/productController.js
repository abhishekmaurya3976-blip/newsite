const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');

// Helper to parse boolean-ish query params
function parseBool(val) {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true' || val === '1') return true;
    if (val.toLowerCase() === 'false' || val === '0') return false;
  }
  return undefined;
}

// Helper to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

// Cloudinary upload helper
const uploadToCloudinary = async (buffer, originalname, folder = 'art-palzaa') => {
  try {
    const cloudinary = require('../config/cloudinary');
    
    // Convert buffer to base64 string for Cloudinary
    const base64String = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: `${folder}/products`,
      public_id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
      ],
      resource_type: 'auto'
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Fallback to base64 if Cloudinary fails
const bufferToBase64 = (buffer, mimeType) => {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

// @desc    Get products with filters
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 12);
  const skip = (page - 1) * limit;

  const {
    search,
    categoryId,
    categorySlug,
    isActive,
    isFeatured,
    isBestSeller,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    minPrice,
    maxPrice,
  } = req.query;

  // Build query
  let query = {};

  // Search
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { name: searchRegex },
      { sku: searchRegex },
      { description: searchRegex },
      { shortDescription: searchRegex },
      { tags: searchRegex }
    ];
  }

  // Filter by category ID
  if (categoryId && isValidObjectId(categoryId)) {
    query.categoryId = categoryId;
  }

  // Filter by category slug
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug });
    if (category) {
      query.categoryId = category._id;
    }
  }

  // Filter by active status
  const activeBool = parseBool(isActive);
  if (activeBool !== undefined) {
    query.isActive = activeBool;
  }

  // Filter by featured
  const featuredBool = parseBool(isFeatured);
  if (featuredBool !== undefined) {
    query.isFeatured = featuredBool;
  }

  // Filter by best seller
  const bestSellerBool = parseBool(isBestSeller);
  if (bestSellerBool !== undefined) {
    query.isBestSeller = bestSellerBool;
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Sorting
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);

  // Enrich with category info
  const enrichedProducts = await Promise.all(
    products.map(async (product) => {
      if (product.categoryId) {
        const category = await Category.findById(product.categoryId).lean();
        if (category) {
          product.category = {
            id: category._id,
            name: category.name,
            slug: category.slug
          };
        }
      }
      return product;
    })
  );

  res.status(200).json({
    success: true,
    data: {
      products: enrichedProducts,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    }
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }
  
  const product = await Product.findById(id).lean();
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Add category info if categoryId exists
  if (product.categoryId) {
    const category = await Category.findById(product.categoryId).lean();
    if (category) {
      product.category = {
        id: category._id,
        name: category.name,
        slug: category.slug
      };
    }
  }

  // Convert _id to id for frontend consistency
  const productWithId = {
    ...product,
    id: product._id,
    categoryId: product.categoryId ? product.categoryId.toString() : null,
    category: product.category ? {
      ...product.category,
      id: product.category.id.toString()
    } : null
  };

  res.status(200).json({
    success: true,
    data: productWithId
  });
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).lean();
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Add category info if categoryId exists
  if (product.categoryId) {
    const category = await Category.findById(product.categoryId).lean();
    if (category) {
      product.category = {
        id: category._id,
        name: category.name,
        slug: category.slug
      };
    }
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Public
exports.create = asyncHandler(async (req, res) => {
  const payload = req.body;
  
  console.log('Creating product with payload:', payload); // Debug log
  
  // Validate required fields
  if (!payload.name || !payload.price || !payload.sku) {
    return res.status(400).json({
      success: false,
      message: 'Name, price, and SKU are required fields'
    });
  }

  // Generate slug from name
  const slugify = require('slugify');
  payload.slug = slugify(payload.name, { 
    lower: true, 
    strict: true,
    trim: true 
  });
  
  // Check if product with same slug exists
  const existingProduct = await Product.findOne({ slug: payload.slug });
  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: 'Product with this name already exists'
    });
  }
  
  // Validate category if provided
  if (payload.categoryId) {
    // Check if categoryId is a valid ObjectId
    if (!isValidObjectId(payload.categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    
    const category = await Category.findById(payload.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Add category snapshot
    payload.category = {
      id: category._id,
      name: category.name,
      slug: category.slug
    };
  } else {
    // Set categoryId to null if not provided
    payload.categoryId = null;
    payload.category = null;
  }
  
  // Ensure images array exists
  if (!payload.images) {
    payload.images = [];
  }
  
  // Set first image as primary if no primary specified
  if (payload.images.length > 0 && !payload.images.some(img => img.isPrimary)) {
    payload.images[0].isPrimary = true;
  }
  
  // Set defaults for optional fields
  if (!payload.stock) payload.stock = 0;
  if (!payload.tags) payload.tags = [];
  if (payload.isActive === undefined) payload.isActive = true;
  
  const product = await Product.create(payload);
  
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }
  
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  // Check if updating name causes duplicate
  if (req.body.name && req.body.name !== product.name) {
    const slugify = require('slugify');
    const newSlug = slugify(req.body.name, { 
      lower: true, 
      strict: true,
      trim: true 
    });
    
    const existingProduct = await Product.findOne({ 
      slug: newSlug,
      _id: { $ne: id }
    });
    
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }
  }
  
  // Validate category if provided
  if (req.body.categoryId !== undefined) {
    if (req.body.categoryId === '' || req.body.categoryId === null) {
      // Clear category
      req.body.categoryId = null;
      req.body.category = null;
    } else if (!isValidObjectId(req.body.categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    } else {
      const category = await Category.findById(req.body.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Update category snapshot
      req.body.category = {
        id: category._id,
        name: category.name,
        slug: category.slug
      };
    }
  }
  
  // Update product
  Object.keys(req.body).forEach(key => {
    if (key !== 'slug' && key !== '_id') {
      product[key] = req.body[key];
    }
  });
  
  // Regenerate slug if name changed
  if (req.body.name) {
    const slugify = require('slugify');
    product.slug = slugify(req.body.name, { 
      lower: true, 
      strict: true,
      trim: true 
    });
  }
  
  // Ensure at least one primary image
  if (product.images && product.images.length > 0) {
    const hasPrimary = product.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      product.images[0].isPrimary = true;
    }
  }
  
  await product.save();
  
  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }
  
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  // Delete images from Cloudinary if configured
  if (isCloudinaryConfigured() && product.images && product.images.length > 0) {
    try {
      const cloudinary = require('../config/cloudinary');
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
          console.log(`Deleted image from Cloudinary: ${image.publicId}`);
        }
      }
    } catch (error) {
      console.error('Error deleting images from Cloudinary:', error);
      // Continue with deletion even if Cloudinary fails
    }
  }
  
  await product.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: {
      id: product._id,
      name: product.name
    }
  });
});

// @desc    Upload product images to Cloudinary (or fallback to base64)
// @route   POST /api/products/upload-images
// @access  Public
exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }
  
  console.log(`Received ${req.files.length} files to upload`);
  
  const uploadResults = [];
  const useCloudinary = isCloudinaryConfigured();
  
  if (useCloudinary) {
    console.log('Using Cloudinary for image upload');
  } else {
    console.log('Cloudinary not configured. Using base64 fallback.');
  }
  
  try {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`Processing file ${i + 1}: ${file.originalname}, size: ${file.size} bytes`);
      
      let imageData;
      
      if (useCloudinary) {
        // Upload to Cloudinary
        try {
          const cloudinaryResult = await uploadToCloudinary(
            file.buffer,
            file.originalname
          );
          
          imageData = {
            url: cloudinaryResult.url,
            publicId: cloudinaryResult.publicId,
            altText: file.originalname,
            isPrimary: i === 0,
            order: i,
            format: cloudinaryResult.format,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height
          };
          
          console.log(`Uploaded to Cloudinary: ${cloudinaryResult.url}`);
        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed, falling back to base64:', cloudinaryError);
          // Fallback to base64
          const base64String = bufferToBase64(file.buffer, file.mimetype);
          imageData = {
            url: base64String,
            altText: file.originalname,
            isPrimary: i === 0,
            order: i,
            publicId: `base64_${Date.now()}_${i}`
          };
        }
      } else {
        // Use base64
        const base64String = bufferToBase64(file.buffer, file.mimetype);
        imageData = {
          url: base64String,
          altText: file.originalname,
          isPrimary: i === 0,
          order: i,
          publicId: `base64_${Date.now()}_${i}`
        };
      }
      
      uploadResults.push(imageData);
    }
    
    console.log(`Successfully processed ${uploadResults.length} images`);
    
    res.status(200).json({
      success: true,
      message: `${uploadResults.length} image(s) uploaded successfully`,
      data: uploadResults
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images. Please try again.'
    });
  }
});