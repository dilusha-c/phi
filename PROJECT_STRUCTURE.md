# Sri Lanka Dengue Surveillance & PHI Management System - Project Structure

This document defines the initial folder structure and the npm packages to install in the next step. No authentication, database models, API endpoints, or frontend pages are included yet.

## Root Layout

- `frontend/` - React + Vite application for PHIs, hospitals, and MOH officers.
- `backend/` - Node.js + Express.js API organized with MVC principles.

## Frontend Structure

- `frontend/public/` - Static files served directly by Vite.
- `frontend/src/assets/` - Images, icons, fonts, and other static assets used by the UI.
- `frontend/src/components/` - Reusable UI building blocks such as buttons, cards, tables, modals, and form controls.
- `frontend/src/context/` - React context providers for shared application state.
- `frontend/src/hooks/` - Reusable custom React hooks.
- `frontend/src/layouts/` - Layout shells such as authenticated layout, dashboard layout, or public layout.
- `frontend/src/pages/` - Route-level page components. These will be added later.
- `frontend/src/routes/` - Client-side routing configuration.
- `frontend/src/services/` - Axios-based API client modules and request wrappers.
- `frontend/src/store/` - Global client state management setup if needed later.
- `frontend/src/styles/` - Global styles, Tailwind entry points, and theme-related styles.
- `frontend/src/utils/` - Shared utility functions for formatting, validation, and helpers.
- `frontend/src/constants/` - Frontend constants such as route names, status labels, and UI values.
- `frontend/src/types/` - Type definitions and interfaces for frontend data structures.

## Backend Structure

- `backend/src/config/` - Environment, database, and application configuration.
- `backend/src/constants/` - Shared backend constants such as roles, statuses, and API messages.
- `backend/src/controllers/` - Request handlers that receive input and return HTTP responses.
- `backend/src/jobs/` - Background jobs, scheduled tasks, or queue workers.
- `backend/src/middlewares/` - Express middleware for error handling, validation, logging, and security.
- `backend/src/models/` - Mongoose schemas and data models, to be added later.
- `backend/src/routes/` - REST API route definitions.
- `backend/src/services/` - Business logic layer used by controllers.
- `backend/src/tests/` - Backend test files.
- `backend/src/utils/` - Reusable helpers for formatting, parsing, and shared server-side utilities.
- `backend/src/validations/` - Request validation schemas and validation helpers.

## Package List To Install Next

### Frontend
- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `vite`
- `@vitejs/plugin-react`

### Backend
- `express`
- `mongoose`
- `dotenv`
- `cors`
- `helmet`
- `morgan`
- `bcryptjs`
- `jsonwebtoken`
- `express-validator`
- `cookie-parser`
- `compression`

### Backend Development Dependencies
- `nodemon`
- `jest`
- `supertest`
- `eslint`
- `prettier`

## Notes

- Backend follows MVC: routes -> controllers -> services -> models.
- Shared concerns like validation, middleware, utilities, and constants are separated to keep the codebase modular.
- The next step can be package initialization and config scaffolding after you confirm this structure.
