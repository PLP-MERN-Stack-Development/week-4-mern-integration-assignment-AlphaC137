# MERN Stack Blog Application

[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19753564&assignment_repo_type=AssignmentRepo)

A full-featured blog application built with the MERN (MongoDB, Express, React, Node.js) stack, demonstrating seamless integration between front-end and back-end components.

## Features

- User authentication (register/login/logout)
- User profile management
- Create, read, update, delete blog posts
- Categories for organizing posts
- Comment system
- Image upload functionality
- Responsive design using Tailwind CSS

## Project Structure

The application is divided into two main directories:

```
mern-blog/
├── client/                 # React front-end with Vite
│   ├── src/                # React source code
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── App.jsx         # Main application component
│   │   ├── main.jsx        # Application entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Client dependencies
├── server/                 # Express.js back-end
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API route definitions
│   ├── uploads/            # Uploaded files storage
│   ├── server.js           # Server entry point
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```
## Technologies Used

### Frontend
- React.js
- React Router for navigation
- React Query for data fetching and caching
- React Hook Form for form validation
- Tailwind CSS for styling
- Vite as build tool
- Context API for state management
- React Toastify for notifications

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Joi for input validation
- Bcrypt for password hashing

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Environment Setup

1. Clone the repository

2. Install dependencies for both client and server
   ```powershell
   cd client
   npm install
   
   cd ../server
   npm install
   ```

3. Create environment files:

   For client (`client/.env`):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

   For server (`server/.env`):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-blog
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

### Running the Application

1. Start the server
   ```powershell
   cd server
   npm run dev
   ```

2. In a separate terminal, start the client
   ```powershell
   cd client
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change user password

### Posts
- `GET /api/posts` - Get all posts (supports pagination and filtering)
- `GET /api/posts/:id` - Get a single post
- `POST /api/posts` - Create a post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/comments` - Add comment to post
- `GET /api/posts/search?q=query` - Search posts

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a category

## Features Implementation

### Authentication
- JWT-based authentication
- Protected routes on both client and server
- User registration and login
- Profile management

### Blog Posts
- Full CRUD operations
- Rich text editor integration
- Image uploads for post featured images
- Category assignment
- Commenting system

### User Experience
- Responsive design with Tailwind CSS
- Loading states and error handling
- Form validation
- Toast notifications for user feedback
- Optimistic UI updates

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
