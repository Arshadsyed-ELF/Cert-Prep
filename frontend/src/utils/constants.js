export const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

export const CERTIFICATION_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

export const CERTIFICATION_TYPES = [
  'MongoDB',
  'MERN Stack',
  'JavaScript',
  'React',
  'Node.js',
  'AWS',
  'Azure',
  'Python'
];

export const QUIZ_STATUSES = {
  NOT_ATTEMPTED: 'Not Attempted',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

export const READINESS_STATUSES = {
  EXCELLENT: 'Excellent / Highly Ready',
  READY: 'Ready',
  ALMOST_READY: 'Almost Ready',
  NEEDS_IMPROVEMENT: 'Needs Improvement',
  NOT_READY: 'Not Ready'
};