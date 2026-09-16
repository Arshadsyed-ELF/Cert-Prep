const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  certificationType: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  passingPercentage: {
    type: Number,
    required: true,
  },
  questions: [
    {
      questionType: {
        type: String,
        enum: ['MCQ', 'MAQ'],
        default: 'MCQ',
      },
      question: {
        type: String,
        required: true,
      },
      options: [
        {
          text: {
            type: String,
            required: true,
          },
        },
      ],
      correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
      difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);