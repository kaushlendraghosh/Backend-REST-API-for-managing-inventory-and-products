const express = require('express');
const router = express.Router();
const { authMiddleware, adminCheck } = require('../middleware/authMiddleware');
const {
    addProduct,
    getProducts,
    getProductById,
    updateProductQuantity,
    updateProduct,
    deleteProduct,
    getProductAnalytics
} = require('../controllers/productController');


router.post('/products', authMiddleware, addProduct);


router.get('/products', authMiddleware, getProducts);


router.get('/products/analytics', authMiddleware, getProductAnalytics);


router.get('/products/:id', authMiddleware, getProductById);


router.put('/products/:id/quantity', authMiddleware, updateProductQuantity);


router.put('/products/:id', authMiddleware, updateProduct);


router.delete('/products/:id', authMiddleware, deleteProduct);

module.exports = router;