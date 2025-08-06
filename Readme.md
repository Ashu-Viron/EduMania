
# 📘 ConsultFlow - Full-Stack Consultation Platform
This project is a modern, full-stack application for managing professional consultations. It features a robust, role-based system for both regular users and consultants, complete with real-time communication tools and a clean, responsive UI.

## 🔧 Tech Stack

### Frontend
- React: A modern JavaScript library for building user interfaces.
- Vite: A fast build tool for the frontend.
- TypeScript: Ensures type safety throughout the application.
- Zustand: A lightweight and scalable state management solution.
- TanStack Query: Manages server state, caching, and background data fetching.
- Tailwind CSS: A utility-first CSS framework for rapid UI development.
- i18next: Provides internationalization support for English and Korean.
- Heroicons: A library of beautiful, accessible SVG icons.
- WebRTC: Powers the real-time video and voice call functionality.
- Socket.IO Client: Establishes the real-time WebSocket connection for chat.

### Backend
- NestJS: A powerful, scalable Node.js framework for building efficient server-side applications.
- PostgreSQL: A robust and reliable open-source relational database.
- Prisma ORM: An elegant and type-safe ORM for database access.
- Socket.IO: The WebSocket server for real-time chat and WebRTC signaling.
- class-validator & class-transformer: Ensures data integrity and validation for all API requests.

### 📦 Features Implemented

This project is now a complete, functional application with the following key features:

## Full-Stack Authentication:
- A secure registration and login system that supports both USER and CONSULTANT roles.

## Role-Based Access Control:
- Routing: Users are automatically redirected to their respective dashboards after login.
- API Security: All protected endpoints are secured using JWTs and role-specific guards (USER or CONSULTANT roles).

## Modern Dashboards:
- User Dashboard: Provides an overview of estimates and consultations with a dynamic pie chart.
- Consultant Dashboard: Displays performance statistics, upcoming appointments, and a monthly consultation chart.

## Real-time Communication:
- WebSockets: A persistent WebSocket connection for real-time events and notifications.
- Real-time Chat: A fully functional chat interface with a live typing indicator.
- WebRTC Video/Voice Calls: Users can initiate and manage one-on-one video and voice calls directly from the chat interface.

## Estimates Module:
- USER role can create, view, edit, approve, and reject project estimates.

## Consultations Module:
- USER role can schedule, view, edit, and cancel consultations with consultants.
- CONSULTANT role can manage their appointments, mark them as complete, and add private notes.

## Profile Management:
- Users can update their profile information, change their password, and upload a new profile picture.
- Consultants can update their professional bio, specialties, and hourly rates.

## Internationalization (i18n):
- The entire website is now multilingual, supporting both English and Korean.

## 🛠️ Setup Instructions

## 🔹 Prerequisites
- Node.js >= 18.x
- PostgreSQL database URL

## 🔹 Backend

### Navigate to the backend directory.
```
    cd backend
```

### Install dependencies.
```
    npm install
```
### Create a .env file in the backend directory with your database connection string and a secret key.
```
    DATABASE_URL="postgresql://user:password@host:port/database"
    JWT_SECRET="your-super-secret-key-here"
```
### Run Prisma migrations to set up the database schema.
```
    npx prisma migrate dev --name init
```
### Seed the database with initial demo data for testing.
```
    npx prisma db seed
```
### Start the backend development server.
```
    npm run start:dev
```
 The backend API runs on http://localhost:3001 and the WebSocket server runs on http://localhost:3002.

## 🔹 Frontend

Navigate to the project root directory.

### Install dependencies.

   ``` npm install```

### Start the frontend development server.
```
    npm run dev
```
The frontend runs at http://localhost:5173.

## ⚙️ Technical Decisions

- Modular Architecture: Both frontend and backend are structured into distinct, feature-based modules (e.g., auth, estimates, chat), which makes the codebase scalable and easy to maintain.
- JWT & Guards: Authentication is handled with JWTs, and NestJS Guards provide a robust, declarative way to secure API endpoints based on user roles and permissions.
- Prisma ORM: Chosen for its type-safe database queries and powerful migration tools, which streamline database schema management.
- Real-time with WebSockets/WebRTC: This combination provides a powerful and performant solution for real-time communication, with Socket.IO handling the signaling and WebRTC enabling direct peer-to-peer media streaming.
- i18next: The internationalization framework makes the application adaptable to a global user base with minimal code changes.

👨‍💻 Author
Ashutosh Raj

📄 License
This project is for demonstration and evaluation purposes only.
© 2025 Ashutosh Raj – All rights reserved.

