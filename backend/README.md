# Cert-Prep Backend README

# Cert-Prep Backend

## Overview

The Cert-Prep backend is a Node.js application built with Express.js that provides RESTful APIs for managing certification quizzes, user authentication, and tracking quiz attempts. This backend is designed to work seamlessly with the Cert-Prep frontend application.

## Technology Stack

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing user and quiz data.
- **Mongoose**: ODM for MongoDB to manage data models.
- **JWT**: For secure user authentication.

## Project Structure

```
backend/
├── config/               # Database configuration
├── controllers/          # Business logic for handling requests
├── middleware/           # Middleware functions for authentication and error handling
├── models/               # Mongoose models for data schemas
├── routes/               # API route definitions
├── services/             # Business logic and data manipulation
├── utils/                # Utility functions
├── .env.example          # Example environment variables
├── package.json          # Project metadata and dependencies
├── server.js             # Entry point for the application
└── README.md             # Documentation for the backend
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd cert-prep/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file based on the `.env.example` file and fill in the required values.

4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup`: User registration.
- `POST /api/auth/login`: User login.
- `POST /api/auth/admin/login`: Admin login.

### Quiz Management

- `GET /api/quizzes`: Retrieve all quizzes.
- `GET /api/quizzes/:id`: Retrieve a specific quiz by ID.
- `POST /api/quizzes`: Create a new quiz (Admin only).
- `PUT /api/quizzes/:id`: Update an existing quiz (Admin only).
- `DELETE /api/quizzes/:id`: Delete a quiz (Admin only).

### Quiz Attempts

- `POST /api/attempts`: Submit quiz answers.
- `GET /api/attempts/my`: Retrieve user's quiz attempt history.
- `GET /api/attempts/:id`: Retrieve a specific quiz attempt by ID.

### Readiness

- `GET /api/readiness`: Retrieve overall readiness score.
- `GET /api/readiness/:certificationType`: Retrieve readiness score for a specific certification type.

## Middleware

- **authMiddleware**: Validates JWT tokens for protected routes.
- **adminMiddleware**: Restricts access to admin-only routes.
- **errorMiddleware**: Centralized error handling for consistent API responses.

## Contribution

Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.