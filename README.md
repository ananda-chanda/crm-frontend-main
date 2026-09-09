CRM Frontend

React + Vite frontend application for the CRM system.

Tech Stack

React

Vite

JavaScript

ESLint

Requirements

Node.js

npm

Access to the CRM backend API

Installation

npm install

Environment Variables

Create a .env file in the frontend root directory, beside package.json.

Example:

VITE_API_URL=http://localhost:3000

Use it in React with:

import.meta.env.VITE_API_URL

If the backend is deployed, replace the local URL with the deployed backend URL:

VITE_API_URL=https://your-backend.onrender.com

Vite exposes frontend variables only when they start with VITE_.

Do not put MongoDB credentials, JWT secrets, or other backend secrets in the frontend .env. Frontend environment variables are bundled into browser code and should be treated as public.

Add the following to .gitignore:

node_modules/
.env
.env.local
.env.*.local

Run Locally

Start the development server:

npm run dev

Vite normally runs at:

http://localhost:5173

Production Build

Build the application:

npm run build

Preview the production build:

npm run preview

The production output is generated in:

dist/

Deployment

For a typical Vite deployment:

Build Command

npm run build

Output / Publish Directory

dist

Set the frontend environment variable before building:

VITE_API_URL=https://your-backend-url

After the frontend is deployed, update the backend FRONTEND_URL environment variable to the deployed frontend URL so that CORS allows requests from the frontend.

Backend Connection

During local development:

Frontend: http://localhost:5173
Backend:  http://localhost:3000

In production, the frontend should use the deployed backend URL through VITE_API_URL.

Typical Project Structure

frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js

The actual structure may vary based on the current implementation.

ESLint

If the project contains a lint script, run:

npm run lint

Quick Start

npm install
npm run dev

Then open:

http://localhost:5173