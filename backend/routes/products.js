const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    searchProducts, 
    getProductsByCategory, 
    updateStock,
    upload 
} = require('../controllers/productController');
const { verifyToken, requireFarmer, requireAdminRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Protected routes (require authentication)
router.post('/', verifyToken, requireFarmer, upload.single('image'), createProduct);
router.put('/:id', verifyToken, requireFarmer, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, requireFarmer, deleteProduct);
router.patch('/:id/stock', verifyToken, requireFarmer, updateStock);

// Admin routes
router.get('/admin/all', verifyToken, requireAdminRole, getAllProducts);

module.exports = router; 