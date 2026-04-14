# UserHub — MERN User Management System

A full-stack User Management System built with the MERN stack featuring role-based access control (RBAC), JWT authentication with refresh tokens, and a clean modern UI.

---

## Features

- **JWT Authentication** with access + refresh token flow
- **Role-Based Access Control** — Admin, Manager, User
- **User Management** — Create, Read, Update, Soft-Delete (deactivate)
- **Pagination, Search & Filters** on user list
- **Audit Trail** — createdBy, updatedBy, timestamps
- **Clean, responsive UI** built with Tailwind CSS

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (access + refresh), bcryptjs    |
| UI Icons   | Lucide React                        |
| Toasts     | react-hot-toast                     |

---

## Project Structure

```
user-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   └── utils/          # Seed script
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Layout, ProtectedRoute
    │   ├── context/        # AuthContext
    │   ├── pages/          # All page components
    │   └── services/       # Axios API client
    ├── index.html
    ├── .env.example
    └── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/user-management
JWT_SECRET=your_very_secret_key
JWT_REFRESH_SECRET=your_very_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Seed the database with demo users:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Demo Credentials

After running `npm run seed`:

| Role    | Email                  | Password      |
|---------|------------------------|---------------|
| Admin   | admin@example.com      | Admin@123     |
| Manager | manager@example.com    | Manager@123   |
| User    | user@example.com       | User@123      |

---

## API Reference

### Auth
| Method | Endpoint           | Access  | Description           |
|--------|--------------------|---------|-----------------------|
| POST   | /api/auth/login    | Public  | Login & get tokens    |
| POST   | /api/auth/refresh  | Public  | Refresh access token  |
| POST   | /api/auth/logout   | Private | Logout                |
| GET    | /api/auth/me       | Private | Get current user      |

### Users
| Method | Endpoint          | Access         | Description               |
|--------|-------------------|----------------|---------------------------|
| GET    | /api/users        | Admin, Manager | List users (paginated)    |
| POST   | /api/users        | Admin          | Create user               |
| GET    | /api/users/stats  | Admin          | Get system stats          |
| GET    | /api/users/:id    | All (own only for User) | Get user detail |
| PUT    | /api/users/:id    | Admin, Manager, Self | Update user         |
| DELETE | /api/users/:id    | Admin          | Deactivate user           |

---

## Role Permissions

| Action                | Admin | Manager | User |
|-----------------------|-------|---------|------|
| View all users        | ✓     | ✓ (non-admin) | ✗ |
| Create user           | ✓     | ✗       | ✗    |
| Edit any user         | ✓     | ✓ (non-admin) | ✗ |
| Edit own profile      | ✓     | ✓       | ✓    |
| Delete/deactivate     | ✓     | ✗       | ✗    |
| Assign roles          | ✓     | ✗       | ✗    |
| View stats            | ✓     | ✗       | ✗    |

---

## Deployment

### Backend (Render / Railway)
1. Set all environment variables from `.env.example`
2. Set `NODE_ENV=production`
3. Set `CLIENT_URL` to your frontend URL
4. Build command: `npm install`
5. Start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your deployed backend URL
2. Build command: `npm run build`
3. Output directory: `dist`
