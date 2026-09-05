# KANCIL Library Management System - Backend API

This is the backend server for the KANCIL Library Management System. It is built with **Node.js**, **Express**, **TypeScript**, and uses **Prisma ORM** to connect to a **MySQL** database.

## Prerequisites

Before running the server, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A MySQL Database (Local or Hosted, e.g., Railway, Aiven, etc.)

## Installation

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the root of the `server` folder (or copy from `.env.example` if available).
2. Configure your environment variables in the `.env` file. Example:

   ```env
   # Server Configuration
   PORT=5050

   # Database Connection String (MySQL)
   DATABASE_URL="mysql://username:password@host:port/database_name"

   # JWT Secret Key for Authentication
   JWT_SECRET="your_super_secret_jwt_key"
   ```

## Database Setup (Prisma)

After setting up your `DATABASE_URL` in the `.env` file, you need to synchronize your Prisma schema with the database:

1. Push the schema to your database (this creates the tables):
   ```bash
   npm run prisma:push
   ```
   *(Note: Alternatively, you can use `npx prisma migrate dev` if you want to use migration files).*

2. Generate the Prisma Client:
   ```bash
   npm run prisma:generate
   ```

3. (Optional) Seed the database with initial data:
   ```bash
   npx prisma db seed
   ```

## Running the Server

### Development Mode

To start the server in development mode with hot-reloading (using `tsx watch`):
```bash
npm run dev
```
The server will usually run on `http://localhost:5050` (or whatever `PORT` you specified in `.env`).

### Production Mode

To build and run the server for production:

1. Compile the TypeScript code to JavaScript:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Useful Commands

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the project into the `dist/` directory.
- `npm start` - Runs the built version of the project.
- `npm run prisma:studio` - Opens a visual editor in your browser to view and edit your database records.
- `npm run prisma:push` - Pushes the schema state to the database without generating migration files.
- `npm run prisma:generate` - Generates Prisma Client.

## API Documentation

*(If you have API endpoints like `/api/auth/login`, `/api/books`, etc., you can list them here, or link to a Postman/Swagger documentation).*

- **Authentication**: JWT based. Include `Authorization: Bearer <token>` in the header for protected routes.
