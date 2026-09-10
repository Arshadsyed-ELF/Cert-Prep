const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'cert-prep-dev-secret';

// Generate a JWT token
const generateToken = (userId, role) => {
    const payload = { userId, role };
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '1h' });
};

// Verify a JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, getJwtSecret());
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
};