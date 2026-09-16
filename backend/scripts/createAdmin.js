const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const ask = (rl, question) => new Promise((resolve) => rl.question(question, resolve));

const createAdmin = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        const name = (await ask(rl, 'Admin name: ')).trim();
        const email = (await ask(rl, 'Admin email: ')).trim().toLowerCase();
        const password = await ask(rl, 'Admin password: ');

        if (!name || !email || !password) {
            throw new Error('Name, email, and password are required.');
        }

        await mongoose.connect(process.env.MONGO_URI);

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.role !== 'admin') {
            throw new Error('That email already belongs to a normal user. Choose another email.');
        }

        const admin = existingUser || new User({ email });
        admin.name = name;
        admin.password = password;
        admin.role = 'admin';
        await admin.save();

        console.log(existingUser ? 'Admin account updated.' : 'Admin account created.');
    } catch (error) {
        console.error(`Unable to create admin: ${error.message}`);
        process.exitCode = 1;
    } finally {
        rl.close();
        await mongoose.disconnect();
    }
};

createAdmin();
