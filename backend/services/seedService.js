const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');

const seedQuizzes = async () => {
    const quizzes = [
        {
            title: 'MongoDB Beginner',
            certificationType: 'MongoDB',
            certificationLevel: 'Beginner',
            description: 'Basic questions for MongoDB certification preparation.',
            duration: 30,
            passingPercentage: 70,
            questions: [
                {
                    question: 'What is MongoDB?',
                    options: [{ text: 'A SQL database' }, { text: 'A NoSQL database' }, { text: 'A programming language' }, { text: 'A web framework' }],
                    correctAnswer: 'A NoSQL database',
                    explanation: 'MongoDB is a NoSQL database that uses a document-oriented data model.',
                    difficulty: 'Easy'
                },
                // Add more questions as needed
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: 'MongoDB Intermediate',
            certificationType: 'MongoDB',
            certificationLevel: 'Intermediate',
            description: 'Intermediate questions for MongoDB certification preparation.',
            duration: 45,
            passingPercentage: 75,
            questions: [
                {
                    question: 'Which method is used to insert a document in MongoDB?',
                    options: [{ text: 'insert()' }, { text: 'add()' }, { text: 'insertOne()' }, { text: 'create()' }],
                    correctAnswer: 'insertOne()',
                    explanation: 'The insertOne() method is used to insert a single document into a collection.',
                    difficulty: 'Medium'
                },
                // Add more questions as needed
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: 'MongoDB Advanced',
            certificationType: 'MongoDB',
            certificationLevel: 'Advanced',
            description: 'Advanced questions for MongoDB certification preparation.',
            duration: 60,
            passingPercentage: 80,
            questions: [
                {
                    question: 'What is the purpose of the aggregation framework in MongoDB?',
                    options: [{ text: 'To perform complex queries' }, { text: 'To transform data' }, { text: 'To perform calculations on data' }, { text: 'All of the above' }],
                    correctAnswer: 'All of the above',
                    explanation: 'The aggregation framework is used to process data and perform calculations on it.',
                    difficulty: 'Hard'
                },
                // Add more questions as needed
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        // Add more quizzes as needed
    ];

    try {
        await Quiz.deleteMany(); // Clear existing quizzes
        await Quiz.insertMany(quizzes); // Seed new quizzes
        console.log('Database seeded with quizzes!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

module.exports = { seedQuizzes };