const validateProduct = (req, res, next) => {
    const { productName, description, price, category, unit } = req.body;
    
    const errors = [];
    
    if (!productName || productName.trim().length === 0) {
        errors.push('Product name is required');
    }
    
    if (!description || description.trim().length === 0) {
        errors.push('Product description is required');
    }
    
    if (!price || isNaN(price) || price <= 0) {
        errors.push('Valid price is required');
    }
    
    if (!category || !['fruits', 'vegetables', 'dairy', 'grains', 'herbs', 'other'].includes(category)) {
        errors.push('Valid category is required');
    }
    
    if (!unit || !['kg', 'g', 'pieces', 'liters', 'dozen'].includes(unit)) {
        errors.push('Valid unit is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

const validateUser = (req, res, next) => {
    const { username, password } = req.body;
    
    const errors = [];
    
    if (!username || username.trim().length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

module.exports = {
    validateProduct,
    validateUser
}; 