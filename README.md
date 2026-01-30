# Canvas API Student Dashboard

A full-stack monorepo application with React frontend and Express backend.

## Project Structure

```
canvas-api-student-dashboard/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/           # Express API server
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── package.json       # Root workspace configuration
├── .gitignore
├── .nvmrc
└── README.md
```

## Prerequisites

- Node.js (v20 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Install Dependencies

From the root directory, install all dependencies for both frontend and backend:

```bash
npm install
```

This will install dependencies in the root, frontend, and backend workspaces.

### 2. Set Up Environment Variables

Navigate to the backend folder and create a `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file if you need to change the default port (5000).

### 3. Run the Development Server

From the root directory, start both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

### Individual Commands

Run only the frontend:
```bash
npm run dev:frontend
```

Run only the backend:
```bash
npm run dev:backend
```

## Production Build

Build the frontend for production:

```bash
npm run build
```

The built files will be in `frontend/dist/`.

Start the backend in production mode:

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build the frontend for production
- `npm start` - Start the backend in production mode

## License

MIT
