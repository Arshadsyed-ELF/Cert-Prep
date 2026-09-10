const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

// Function to hash user passwords
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Function to compare passwords
const comparePasswords = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
};

// Function to handle user signup
const signup = async (name, email, password) => {
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    return newUser;
};

// Function to handle user login
const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await comparePasswords(password, user.password))) {
        throw new Error('Invalid email or password');
    }
    const token = generateToken(user);
    return { user, token };
};

module.exports = {
    signup,
    login,
};