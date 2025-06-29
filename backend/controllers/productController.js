const localStorage = require('../services/localStorage');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../frontend/public/uploads');
        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await localStorage.getAllProducts();
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const product = await localStorage.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
};

// Create new product
const createProduct = async (req, res) => {
    try {
        const productData = {
            productName: req.body.productName,
            description: req.body.description,
            price: parseFloat(req.body.price),
            category: req.body.category,
            unit: req.body.unit,
            stock: parseInt(req.body.stock) || 0,
            isAvailable: req.body.isAvailable !== 'false',
            imageUrl: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl
        };

        // Validation
        if (!productData.productName || !productData.description || !productData.price) {
            return res.status(400).json({
                success: false,
                message: 'Product name, description, and price are required'
            });
        }

        const newProduct = await localStorage.createProduct(productData);
        res.status(201).json({
            success: true,
            data: newProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product'
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const updateData = {
            productName: req.body.productName,
            description: req.body.description,
            price: req.body.price ? parseFloat(req.body.price) : undefined,
            category: req.body.category,
            unit: req.body.unit,
            stock: req.body.stock ? parseInt(req.body.stock) : undefined,
            isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable !== 'false' : undefined
        };

        // Add image if uploaded
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        const updatedProduct = await localStorage.updateProduct(req.params.id, updateData);
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await localStorage.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete associated image if exists
        if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '../../frontend/public', product.imageUrl);
            try {
                await fs.remove(imagePath);
            } catch (error) {
                console.warn('Could not delete image file:', error);
            }
        }

        await localStorage.deleteProduct(req.params.id);
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
};

// Search products
const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const products = await localStorage.searchProducts(query);
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching products'
        });
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const products = await localStorage.getProductsByCategory(category);
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error getting products by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category'
        });
    }
};

// Update product stock
const updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        if (stock === undefined || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid stock quantity is required'
            });
        }

        const updatedProduct = await localStorage.updateProduct(req.params.id, { stock });
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: updatedProduct,
            message: 'Stock updated successfully'
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock'
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory,
    updateStock,
    upload
}; 