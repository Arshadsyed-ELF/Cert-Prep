const adminMiddleware = (req, res, next) => {
    // Check if the user role is admin
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin, proceed to the next middleware
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        }); // User is not admin, deny access
    }
};

module.exports = adminMiddleware;