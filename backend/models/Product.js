const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    type: {
        type: String,
        required: [true, 'Product type is required'],
        trim: true,
        maxlength: [50, 'Product type cannot exceed 50 characters']
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        trim: true,
        uppercase: true,
        maxlength: [20, 'SKU cannot exceed 20 characters']
    },
    image_url: {
        type: String,
        trim: true,
        validate: {
            validator: function(url) {
                if (!url) return true; // Optional field
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                return urlPattern.test(url);
            },
            message: 'Please provide a valid URL'
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be a whole number'
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
productSchema.index({ sku: 1 });
productSchema.index({ name: 1 });
productSchema.index({ type: 1 });
productSchema.index({ createdBy: 1 });

// Virtual for product ID (for API response)
productSchema.virtual('product_id').get(function() {
    return this._id.toHexString();
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.product_id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Product', productSchema);