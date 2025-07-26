const Product = require('../models/Product');
const { 
    validateProductData, 
    validateQuantityUpdate, 
    sanitizeInput, 
    validatePaginationParams 
} = require('../utils/validation');

// Add new product
const addProduct = async (req, res) => {
    try {
        const { name, type, sku, image_url, description, quantity, price } = req.body;

        // Sanitize inputs
        const productData = {
            name: sanitizeInput(name),
            type: sanitizeInput(type),
            sku: sanitizeInput(sku),
            image_url: image_url ? sanitizeInput(image_url) : '',
            description: description ? sanitizeInput(description) : '',
            quantity: parseInt(quantity),
            price: parseFloat(price),
            createdBy: req.user._id
        };

        // Validate product data
        const validation = validateProductData(productData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Create product
        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product_id: product._id.toString(),
            product: product
        });

    } catch (error) {
        console.error('Add product error:', error);

        res.status(500).json({
            success: false,
            message: 'Internal server error while adding product'
        });
    }
};

// Get all products with pagination
const getProducts = async (req, res) => {
    try {
        const { page, limit, search, type, sortBy, sortOrder } = req.query;
        
        // Validate pagination parameters
        const { page: validPage, limit: validLimit } = validatePaginationParams(page, limit);
        
        // Build query
        let query = {};
        
        if (search) {
            const searchRegex = new RegExp(sanitizeInput(search), 'i');
            query.$or = [
                { name: searchRegex },
                { sku: searchRegex },
                { description: searchRegex }
            ];
        }
        
        if (type) {
            query.type = sanitizeInput(type);
        }
        
        // Build sort options
        let sortOptions = {};
        const allowedSortFields = ['name', 'price', 'quantity', 'createdAt', 'updatedAt'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const order = sortOrder === 'asc' ? 1 : -1;
        sortOptions[sortField] = order;
        
        // Execute query with pagination
        const skip = (validPage - 1) * validLimit;
        
        const [products, totalCount] = await Promise.all([
            Product.find(query)
                .populate('createdBy', 'username')
                .sort(sortOptions)
                .skip(skip)
                .limit(validLimit)
                .lean(),
            Product.countDocuments(query)
        ]);
        
        const totalPages = Math.ceil(totalCount / validLimit);
        
        res.status(200).json({
            data: products,
            pagination: {
                currentPage: validPage,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: validLimit,
                hasNextPage: validPage < totalPages,
                hasPrevPage: validPage > 1
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching products'
        });
    }
};

// Get single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        const product = await Product.findById(id).populate('createdBy', 'username');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching product'
        });
    }
};

// Update product quantity
const updateProductQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        // Validate product ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        // Validate quantity
        const quantityValidation = validateQuantityUpdate(quantity);
        if (!quantityValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: quantityValidation.error
            });
        }
        
        // Find and update product
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Update quantity
        product.quantity = quantity;
        await product.save();
        
        res.status(200).json({
            success: true,
            message: 'Product quantity updated successfully',
            product: {
                id: product._id,
                name: product.name,
                sku: product.sku,
                quantity: product.quantity,
                updatedAt: product.updatedAt
            }
        });

    } catch (error) {
        console.error('Update quantity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating quantity'
        });
    }
};

// Update product details
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Validate product ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        // Remove fields that shouldn't be updated
        delete updates.createdBy;
        delete updates.createdAt;
        delete updates._id;
        
        // Sanitize string inputs
        Object.keys(updates).forEach(key => {
            if (typeof updates[key] === 'string') {
                updates[key] = sanitizeInput(updates[key]);
            }
        });
        
        // Find and update product
        const product = await Product.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('createdBy', 'username');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('Update product error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating product'
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate product ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting product'
        });
    }
};

// Get product analytics (stretch goal)
const getProductAnalytics = async (req, res) => {
    try {
        const [
            totalProducts,
            lowStockProducts,
            mostRecentProducts,
            productsByType
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ quantity: { $lt: 10 } }),
            Product.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name sku quantity createdAt'),
            Product.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        totalQuantity: { $sum: '$quantity' },
                        avgPrice: { $avg: '$price' }
                    }
                },
                { $sort: { count: -1 } }
            ])
        ]);
        
        res.status(200).json({
            success: true,
            analytics: {
                totalProducts,
                lowStockProducts,
                mostRecentProducts,
                productsByType
            }
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching analytics'
        });
    }
};

module.exports = {
    addProduct,
    getProducts,
    getProductById,
    updateProductQuantity,
    updateProduct,
    deleteProduct,
    getProductAnalytics
};