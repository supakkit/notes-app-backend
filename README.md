# Notes App Backend

A RESTful API built with **TypeScript**, **Express**, and **MongoDB** for managing user notes.  
It includes **JWT-based authentication**, **Zod validation**, **rate limiting**, and **AI-powered note summaries** using the OpenAI API.

---

## Features

- **User Authentication** (Register, Login, Protected Routes)
- **CRUD operations for Notes**
- **AI-powered Note Summaries** via OpenAI API
- **API Documentation** with Swagger at `/api-docs`
- **Schema Validation** with Zod
- **MongoDB Integration** with Mongoose
- **Security Middleware** (Helmet, Rate Limiting, CORS)
- **Testing** using Vitest + Supertest

---

## Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Auth:** JWT + bcrypt
- **Docs:** Swagger (via `swagger-ui-express`)
- **AI:** OpenAI API
- **Testing:** Vitest + Supertest

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/supakkit/notes-app-backend.git
cd notes-app-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the project root using the provided example:

```bash
cp .env.example .env
```

Edit the file and add your configuration:

```env
NODE_ENV=development
PORT=3100
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
```

---

## Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Compile TypeScript into JavaScript       |
| `npm start`     | Run the production server (after build)  |
| `npm test`      | Run tests with Vitest and Supertest      |

---

## Database

The backend automatically connects to the MongoDB database defined in your `MONGO_URI` environment variable during startup.
No manual setup or seeding is required.

---

## API Documentation

Interactive Swagger documentation is available once the server is running:

```
http://localhost:3100/api/v1/api-docs
```

It lists all endpoints with example requests and responses.

---

## Running Tests

Run the full test suite:

```bash
npm test
```

Uses:

* **Vitest** for unit testing
* **Supertest** for API endpoint testing
* **mongodb-memory-server** for in-memory MongoDB tests

---

## Project Structure

```graphql
src/
 ├── api/
 │    └── v1/
 │        └── routes/
 ├── config/
 ├── controllers/
 ├── docs/
 ├── errors/
 ├── middleware/
 ├── models/
 ├── tests/
 ├── types/
 ├── utils/
 ├── validators/
 ├── app.ts
 └── server.ts

```

* `api/v1/routes/` – Define API endpoints (versioned)
* `config/` - App configuration (swagger, DB, etc.)
* `controllers/` – Handle request/response logic
* `docs/` - Set up Swagger/OpenAPI documentation
* `errors/` - Custom error middleware
* `middlewares/` – Authentication, validation, and security layers
* `models/` – Define Mongoose schemas
* `tests/` - Unit tests
* `types/` - Custom TypeScript types and interfaces
* `utils/` - Helper functions and utilities
* `validator/` - Zod validation schemas
* `app.ts` - Express app configuration
* `server.ts` – App entry point

---

## Environment Variables

| Variable         | Description                                 |
| ---------------- | ------------------------------------------- |
| `NODE_ENV`       | Environment mode (development / production) |
| `PORT`           | Server port (default: 3100)                 |
| `MONGO_URI`      | MongoDB connection string                   |
| `JWT_SECRET`     | Secret key for signing JWT tokens           |
| `OPENAI_API_KEY` | API key for OpenAI integration              |

---

## Future Improvements

* User roles and permissions
* Improved error handling with custom middleware
* Docker support for easy deployment

---

