const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Invalid email format.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .matches(/\d/)
    .withMessage('Password must contain a number.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter.'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

const validateLogin = [
  body('email').isEmail().withMessage('Invalid email format.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const validateQuizCreation = [
  body('title').notEmpty().withMessage('Quiz title is required.'),
  body('certificationType').notEmpty().withMessage('Certification type is required.'),
  body('certificationLevel').notEmpty().withMessage('Certification level is required.'),
  body('description').notEmpty().withMessage('Description is required.'),
  body('duration').isNumeric().withMessage('Duration must be a number.'),
  body('passingPercentage').isNumeric().withMessage('Passing percentage must be a number.'),
];

const validateQuizAttempt = [
  body('quizId').notEmpty().withMessage('Quiz ID is required.'),
  body('answers').isArray().withMessage('Answers must be an array.'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateQuizCreation,
  validateQuizAttempt,
  validate,
};