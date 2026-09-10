const User = require('../models/User');
const jwt = require('../utils/jwt');
const bcrypt = require('bcrypt');
const apiResponse = require('../utils/apiResponse');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Admin@thesmartbridge.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123@';

exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return apiResponse.error(res, 'All fields are required', 400);
        }

        if (password !== confirmPassword) {
            return apiResponse.error(res, 'Passwords do not match', 400);
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return apiResponse.error(res, 'Email already in use', 409);
        }

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: 'user',
            createdAt: new Date(),
        });

        await user.save();
        const token = jwt.generateToken(user._id, user.role);

        return apiResponse.success(res, 'User registered successfully', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        }, 201);
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error during signup', 500);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return apiResponse.error(res, 'Email and password are required', 400);
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return apiResponse.error(res, 'Invalid credentials', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return apiResponse.error(res, 'Invalid credentials', 401);
        }

        const token = jwt.generateToken(user._id, user.role);
        return apiResponse.success(res, 'Login successful', {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error during login', 500);
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return apiResponse.error(res, 'Email and password are required', 400);
        }

        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            return apiResponse.error(res, 'Invalid admin credentialsss', 401);
        }

        const token = jwt.generateToken('admin', 'admin');
        return apiResponse.success(res, 'Admin login successful', {
            token,
            user: {
                id: 'admin',
                email: ADMIN_EMAIL,
                role: 'admin',
            },
        });
    } catch (error) {
        return apiResponse.error(res, error.message || 'Error during admin login', 500);
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return apiResponse.error(res, 'User not authenticated', 401);
        }

        if (req.user.role === 'admin') {
            return apiResponse.success(res, 'Admin user retrieved successfully', {
                id: req.user.id,
                role: 'admin',
                email: ADMIN_EMAIL,
            });
        }

        return apiResponse.success(res, 'User retrieved successfully', {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        });
    } catch (error) {
        return apiResponse.error(res, error.message || 'Unable to retrieve user', 500);
    }
};

exports.updatePassword = async (req, res) => {
    try {
        if (!req.user || req.user.role === 'admin') {
            return apiResponse.error(res, 'Password update is only available for user accounts', 403);
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return apiResponse.error(res, 'Current password, new password, and confirmation are required', 400);
        }
        if (newPassword.length < 6) {
            return apiResponse.error(res, 'New password must be at least 6 characters long', 400);
        }
        if (newPassword !== confirmPassword) {
            return apiResponse.error(res, 'New passwords do not match', 400);
        }

        const user = await User.findById(req.user.id);
        if (!user) return apiResponse.error(res, 'User not found', 404);

        const matches = await bcrypt.compare(currentPassword, user.password);
        if (!matches) return apiResponse.error(res, 'Current password is incorrect', 401);

        user.password = newPassword;
        await user.save();
        return apiResponse.success(res, 'Password updated successfully');
    } catch (error) {
        return apiResponse.error(res, error.message || 'Unable to update password', 500);
    }
};