const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cert-prep-dev-secret');

        const user = await User.findById(decoded.userId).select('-password');
        if (!user || user.role !== decoded.role) {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }

        req.user = {
            ...user.toObject(),
            id: user._id,
        };
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;