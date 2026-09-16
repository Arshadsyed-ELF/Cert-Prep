# Cert-Prep Quiz Application

## Overview
The **Cert-Prep Quiz Application** is a full-stack application designed to help users prepare for various certification exams through quizzes. The application allows administrators to manage quizzes and users to practice and evaluate their readiness for certification.

## Technology Stack
- **Frontend**: React.js, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT

## Project Structure
```
cert-prep/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
├── .gitignore
└── .env.example
```

## Features
- **User Authentication**: Users can sign up and log in to access quizzes.
- **Admin Dashboard**: Admins can create, update, delete, and manage quizzes.
- **Quiz Management**: Users can attempt quizzes and view their results.
- **Readiness Score**: Users can evaluate their readiness for certification based on quiz attempts.

## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and configure your MongoDB connection string and JWT secret.
4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and set the API URL.
4. Start the frontend:
   ```
   npm run dev
   ```

## MongoDB Setup
Ensure you have a MongoDB instance running and update the connection string in the backend `.env` file.

## Seed Data
To populate the database with initial quiz data, run the seed script provided in the `services/seedService.js`.

## Create an Admin
Admin credentials are stored as a hashed `User` document in MongoDB. After configuring the backend database, run:

```
cd backend
npm run create-admin
```

The command prompts for the admin name, email, and password. Use those values on the admin login page.

## API Documentation
Refer to the backend `README.md` for detailed API endpoints and usage.

## Running the Application
After setting up both the frontend and backend, you can access the application at `http://localhost:5173` for the frontend and `http://localhost:5000` for the backend.

## Conclusion
The Cert-Prep Quiz Application is designed to provide a comprehensive platform for certification preparation, combining user-friendly interfaces with robust backend functionality.