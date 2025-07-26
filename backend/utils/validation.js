// Input validation utilities

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
};

const validateUsername = (username) => {
    // 3-30 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
};

const validateProductData = (data) => {
    const errors = [];
    
    if (!data.name || data.name.trim().length === 0) {
        errors.push('Product name is required');
    }
    
    if (!data.type || data.type.trim().length === 0) {
        errors.push('Product type is required');
    }
    
    if (!data.sku || data.sku.trim().length === 0) {
        errors.push('SKU is required');
    }
    
    if (data.quantity === undefined || data.quantity === null) {
        errors.push('Quantity is required');
    } else if (!Number.isInteger(data.quantity) || data.quantity < 0) {
        errors.push('Quantity must be a non-negative integer');
    }
    
    if (data.price === undefined || data.price === null) {
        errors.push('Price is required');
    } else if (typeof data.price !== 'number' || data.price < 0) {
        errors.push('Price must be a non-negative number');
    }
    
    if (data.image_url && data.image_url.trim().length > 0) {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(data.image_url)) {
            errors.push('Invalid image URL format');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateQuantityUpdate = (quantity) => {
    if (quantity === undefined || quantity === null) {
        return { isValid: false, error: 'Quantity is required' };
    }
    
    if (!Number.isInteger(quantity) || quantity < 0) {
        return { isValid: false, error: 'Quantity must be a non-negative integer' };
    }
    
    return { isValid: true };
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    // Remove potentially harmful characters
    return input
        .trim()
        .replace(/[<>\"'&]/g, '') // Basic XSS prevention
        .substring(0, 1000); // Limit length
};

const validatePaginationParams = (page, limit) => {
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    
    return {
        page: Math.max(1, parsedPage),
        limit: Math.min(100, Math.max(1, parsedLimit)) // Max 100 items per page
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateUsername,
    validateProductData,
    validateQuantityUpdate,
    sanitizeInput,
    validatePaginationParams
};