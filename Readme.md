
# 📘 E-Learning Platform – Feature Module

This project is a core module implementation of an e-learning platform based on the provided Figma design. Built using modern full-stack technologies including React, NestJS, PostgreSQL, and more.

---

## 🔧 Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Zustand (State Management)
- TanStack Query (React Query)
- Responsive Design (PC + Mobile)

### Backend

- NestJS
- PostgreSQL
- Prisma ORM

---

## 📦 Features Implemented

- **Home (홈)** – User dashboard landing page after login
- **Received Estimates / Invoices (받은 견적)** – List of quotes or estimates received
- **Consultation History (상담내역)** – View of all previous inquiries or consultations
- **My Page / Profile (마이페이지)** – User profile page

These modules are built based on the Figma prototype provided. Currently using mock data for frontend development.

---

## 🛠️ Setup Instructions

### 🔹 Prerequisites

- Node.js >= 18.x
- PostgreSQL installed and running
- Git

---

### 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:5173
```

### 🔹 Backend
```bash
cd backend
npm install

# Configure your database connection in .env
# Example:
# DATABASE_URL="postgresql://user:password@localhost:5432/elearning"

npx prisma migrate dev
npm run start:dev
Backend runs at: http://localhost:3000
```

### 📂 Folder Structure
```bash
project-root/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── mockdata/
│   │   └── store/ (Zustand)
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   ├── prisma/
│   │   └── main.ts

```
## ⚙️ Technical Decisions
- Zustand chosen for its lightweight, scalable global state management.

- TanStack Query simplifies server state management, caching, and refetching.

- Prisma ORM enables type-safe DB access and smooth schema management.

- Modular architecture for both frontend and backend to support future scalability.

## 🔄 Known Limitations & Future Improvements
- Currently using mock data on the frontend (/mockdata folder).

- Backend routes are not yet integrated with the frontend UI.

- Will connect API endpoints with frontend via TanStack Query after backend stabilization.

- Improve UI with i18n support for multilingual interface (Korean + English).


# 👨‍💻 Author

### Ashutosh Raj  


---

## 📄 License

This project is for demonstration and evaluation purposes only.  
© 2025 Ashutosh Raj – All rights reserved.

