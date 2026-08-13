# SpenSight REST API Specifications

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)
- `POST /register` — Register a new account with bcrypt password hashing.
- `POST /login` — Authenticate credentials and return signed JWT bearer token.

---

## 2. Transactions & CSV Ingestion (`/api/transactions`)
- `POST /upload-csv` — Accepts multipart CSV files and pushes parsing jobs to Redis BullMQ worker.
- `GET /` — Fetches paginated transaction records.

---

## 3. Analytics & Health Engine (`/api/analytics`, `/api/health`)
- `GET /analytics/spending-patterns` — Aggregates expenditure grouped by categories.
- `GET /health/score` — Computes 0-100 Financial Health Index with savings/expense recommendations.

---

## 4. Categories & Budgets (`/api/categories`, `/api/budgets`)
- `GET /categories` — Fetches standard predefined budget categories.
- `POST /budgets` — Sets category spending caps.