const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();


app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Inventory Management API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);

// For compatibility with test script
app.use('/', authRoutes);
app.use('/', productRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        });
    }
    
    if (err.name === 'MongoError' && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});


app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const server = app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;