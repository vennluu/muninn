# Muninn - Personal CRM & Data Management

Muninn is a personal data management application (CRM) consisting of a Backend (Go) and Frontend (React).

## 📋 Prerequisites

Before installation, ensure your machine has:

- **Go**: Version 1.23 or higher ([Download](https://go.dev/dl/))
- **Node.js**: Version 16 or higher & npm ([Download](https://nodejs.org/))
- **PostgreSQL**: Database ([Download](https://www.postgresql.org/download/))

## 🚀 Installation & Setup

### 1. Clone Source Code

```bash
git clone https://github.com/vennluu/muninn.git
cd muninn
```

### 2. Database Configuration (PostgreSQL)

1. Create a new database named `muninn` in PostgreSQL.
2. Run migration files to create data tables:
   - Use a DB management tool (like DBeaver, pgAdmin) or command line to execute the SQL file at: `server/migrations/001_initial_schema.sql`

### 3. Setup & Run Backend (Server)

Navigate to the `server` directory:

```bash
cd server
```

Create `.env` file from the template:

```bash
# Create .env file
touch .env
```

Open `.env` and fill in the configuration (example):

```env
DATABASE_URL=postgres://user:password@localhost:5432/muninn?sslmode=disable
JWT_SECRET=your_super_secret_key
PORT=8080
```
*(Replace `user`, `password` with your PostgreSQL credentials)*

Install dependencies and run the server:

```bash
# Download dependencies
go mod tidy

# Run server
./start-web.sh
# Or: go run cmd/api/main.go
```

The Backend will run at: `http://localhost:8080`

### 4. Setup & Run Frontend (Webapp)

Open a new terminal, navigate to the `webapp` directory:

```bash
cd webapp
```

Create `.env` file:

```bash
touch .env
```

Content for Frontend `.env`:

```env
PORT=3000
REACT_APP_API_URL=http://localhost:8080
```

Install and run:

```bash
# Install dependencies
npm install

# Run application
npm start
```

The Frontend will run at: `http://localhost:3000`

## 🛠 Project Structure

- `/server`: Backend source code (Golang, Chi Router, SQLC).
- `/webapp`: Frontend source code (ReactJS, TypeScript, Chakra UI).
- `/sql`: Sample SQL files and test data.

## 📝 API Documentation

Backend API runs at `http://localhost:8080`. Main endpoints:

- `/api/health`: Check server status.
- `/api/v1/...`: Main data APIs.
