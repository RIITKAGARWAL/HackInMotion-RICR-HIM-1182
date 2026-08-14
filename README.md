<div align="center">

  <!-- MAIN HERO TITLE -->
  <h1>💰 SpenSight</h1>
  <h3>⚡ Smart Expense Analyzer & Financial Health Dashboard</h3>

  <p align="center">
    <b><i>“Because you can't fix what you can't see — and most people can't see where their money actually goes.”</i></b>
  </p>

  <br>

  <!-- SHIELDS BADGES FOR HACKATHON EVALUATION -->
  <p align="center">
    <a href="https://github.com/RIITKAGARWAL/HackInMotion-RICR-HIM-1182">
      <img src="https://img.shields.io/badge/Hackathon-Hack%20in%20Motion%202026-6f42c1?style=for-the-badge&logo=github&logoColor=white" alt="Hackathon">
    </a>
    <img src="https://img.shields.io/badge/Team%20Code-RICR--HIM--1182-007acc?style=for-the-badge&logo=codeforces&logoColor=white" alt="Team Code">
    <img src="https://img.shields.io/badge/Theme-FinTech%20%26%20Personal%20Finance-28a745?style=for-the-badge&logo=google-pay&logoColor=white" alt="Theme">
    <a href="https://hackinmotion-ricr-him-1182.onrender.com/login.html">
      <img src="https://img.shields.io/badge/Live%20Demo-Render%20Cloud-ff4757?style=for-the-badge&logo=render&logoColor=white" alt="Live Deployment">
    </a>
  </p>

  <p align="center">
    <code>Full-Stack Web Architecture</code> &nbsp;•&nbsp; 
    <code>Automated CSV Ingestion Pipeline</code> &nbsp;•&nbsp; 
    <code>Intelligent Transaction Categorizer</code> &nbsp;•&nbsp; 
    <code>Financial Health Scoring</code>
  </p>

  <p align="center">
    <b>📍 Crafted Live at RICR Campus & Onboard the Bhopal Metro Train</b>
  </p>

</div>

<br>

---

## 📑 Table of Contents
1. [Project Title & Team Details](#-project-title--team-details)
2. [Selected Theme & Problem Statement](#-selected-theme--problem-statement)
3. [Solution Overview](#-solution-overview)
4. [Categorization Engine & AI Approach](#-categorization-engine--ai-approach)
5. [System Architecture Diagram](#-system-architecture-diagram)
6. [Technology Stack](#-technology-stack)
7. [Installation & Setup Guide](#-installation--setup-guide)
8. [Environment Variables](#-environment-variables)
9. [API Documentation](#-api-documentation)
10. [Database Details & Schema](#-database-details--schema)
11. [Live Deployment & Screenshots](#-live-deployment--screenshots)
12. [Future Scope](#-future-scope)

---

## 👥 Project Title & Team Details

* **Project Title:** SpenSight — Smart Expense Analyzer & Financial Health Dashboard
* **Team Name:** `HackInMotion-RICR-HIM-1182`
* **Repository:** [https://github.com/RIITKAGARWAL/HackInMotion-RICR-HIM-1182](https://github.com/RIITKAGARWAL/HackInMotion-RICR-HIM-1182)

### 👥 Team Members

| Role | Member Name | Email Address | GitHub Profile |
| :---: | :--- | :--- | :---: |
| 👑 **Team Leader** | **Ritik Agarwal** | `agarwalritik895@gmail.com` | [`@RIITKAGARWAL`](https://github.com/RIITKAGARWAL) |
| ⚡ **Full-Stack Core** | **Suraj Sahu** | `surajsahusrjs@gmail.com` | [`@SurajTheOptimizerX`](https://github.com/SurajTheOptimizerX) |
| 🎨 **UI/UX Designer** | **Rahul Verma** | `rahulverma945717@gmail.com` | [`@Rahul945717`](https://github.com/Rahul945717) |
| ⚡ **Developer** | **Khushi Pawar** | `khushipawar4345@gmail.com` | [`@KhushiPawar2003`](https://github.com/KhushiPawar2003) |

---

## 🎯 Selected Theme & Problem Statement

* **Selected Theme:** FinTech & Personal Finance
* **Problem Statement:** Smart Expense Analyzer & Financial Health Dashboard

### 🌐 Real-World Context
Most people do not truly understand where their money goes each month. They earn, spend, and are frequently surprised by how little remains without ever grasping why. Standard bank statements are long, confusing, and unhelpful for behavioral analysis. While budgeting tools exist, they are often too complicated, overly generic, or require tedious manual input that users abandon within days.

Real financial health goes beyond basic expense logging—it requires **intelligent pattern recognition**. Questions like overspending on food delivery, undetected recurring subscription drains, or inadequate saving ratios relative to income remain unanswered for the average person.

> ### 💡 The Core Mission
> Build a full-stack web application where users can manage secure accounts, upload financial transactions (via CSV bank statement exports or manual entry), leverage automatic classification and spending pattern analysis, and receive a clear picture of their financial health with personalized, actionable insights.

---

## 🚀 Solution Overview

**SpenSight** transforms raw transaction data into honest financial clarity:

1. **Secure Multi-User Authentication:** Bcrypt password hashing (10 salt rounds) and stateless JWT token authentication ensuring strict user tenant data isolation.
2. **Stream-Based CSV Ingestion:** Fault-tolerant bank statement parser supporting various date formats, currency symbols, and missing columns without memory overload.
3. **Automated Categorization Engine:** Tokenized keyword heuristics and merchant mapping algorithm classifying transactions across Food, Shopping, Subscriptions, Travel, Utilities, and Housing.
4. **Financial Health Index (0–100):** Multi-factor scoring engine evaluating savings ratio, 50/30/20 budget rule adherence, income-to-debt ratio, and month-over-month spending volatility.
5. **Interactive Cleo Financial Assistant:** Natural language assistant answering spending questions and identifying financial leaks.
6. **Glassmorphic Responsive Dashboard:** Zero-dependency modern frontend with interactive Chart.js visualizations, automated PDF summary exports, and dynamic category tracking.

---

## 🤖 Categorization Engine & AI Approach

### Approach Selected: Deterministic Token Matcher & Heuristic Mapping
To ensure **sub-millisecond categorization latency**, **100% privacy** (no external transmission of sensitive personal financial records to 3rd-party APIs), and **zero API rate-limit failure risks** during bulk CSV ingestion:

* **Tokenization & Normalization:** Descriptions are stripped of merchant noise (e.g., `POS-TXN-491028-SWIGGY*BANGALORE` → `swiggy`).
* **Multi-Tier Dictionary Match:** Evaluates primary merchants against high-confidence financial taxonomy tags (e.g., `Netflix`, `Spotify` → `Subscriptions`; `Uber`, `Ola`, `Metro` → `Transportation`).
* **Fallback Heuristic:** Unmatched merchant patterns are flagged for manual reassignment, which adapts future classifications.

---

## 🏗️ System Architecture Diagram

The system follows a decoupled 4-tier client-server architecture with persistent storage and asynchronous queue workers:

```
[ Client Layer (Vanilla JS / Chart.js) ]
                │
                ▼ (HTTPS / REST + JWT Auth)
[ API Gateway & Middleware (Express.js / Multer / CORS) ]
                │
                ├──► [ Rule-Based Categorization Engine ]
                ├──► [ Financial Health Scoring Engine ]
                └──► [ BullMQ Asynchronous Ingestion Worker ]
                                │
                                ▼ (Parameterized Prepared Queries)
                [ Persistence Tier (PostgreSQL Neon Cloud + Redis Cache) ]
```

*The high-resolution architectural diagram is maintained directly in the root directory as [`architecture-diagram.png`](./architecture-diagram.png).*

---

## 🛠️ Technology Stack

### **Frontend**
* **Core:** Semantic HTML5, Vanilla JavaScript (ES6+ Modules)
* **Styling:** Custom Glassmorphic Dark Design System (`#0b0f19` palette)
* **Visualizations:** Chart.js (Doughnut, Bar, Trend Visualizers)
* **Reporting:** `html2pdf.js` Client-Side Statement Generation

### **Backend**
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js REST API
* **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
* **Data Processing:** `csv-parser`, `multer` (multipart/form-data)
* **Async Queues:** BullMQ & Redis

### **Database & Infrastructure**
* **Primary Database:** PostgreSQL (Hosted on Neon Cloud with SSL pooling)
* **Caching:** Redis Cache Layer
* **Deployment:** Render Cloud Platform
* **CI / Code Quality:** ESLint Standard Configuration

---

## 💻 Installation & Setup Guide

Follow these steps to run the complete SpenSight application locally:

### 1. Clone the Repository
```bash
git clone https://github.com/RIITKAGARWAL/HackInMotion-RICR-HIM-1182.git
cd HackInMotion-RICR-HIM-1182
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory (see [Environment Variables](#-environment-variables) below):
```bash
cp .env.example .env
```

### 4. Database Setup & Seeding
```bash
# Run schema migrations and default category seeders
node scripts/initDb.js
node scripts/seed.js
```

### 5. Start the Server
```bash
# Start backend API server
npm run dev
# or: node server.js
```

### 6. Launch the Frontend
Open `Frontend/login.html` directly in your browser or run a local static server:
```bash
npx serve ../Frontend
```

---

## 🔐 Environment Variables

The project requires the following environment variables. An example template is provided in [`.env.example`](./.env.example):

```ini
# Application Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL Neon Cloud)
DATABASE_URL=postgresql://neondb_owner:password@ep-sample-pool.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_signing_key_2026
JWT_EXPIRES_IN=24h

# Redis Cache & Worker Configuration (Optional for Local Mode)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## 📡 API Documentation

All protected endpoints require the HTTP header: `Authorization: Bearer <JWT_TOKEN>`. A full reference is available in [`api-documentation.md`](./api-documentation.md).

### **1. Authentication Endpoints**
| Method | Endpoint | Description | Request Body |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | `{ "name", "email", "password" }` |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT | `{ "email", "password" }` |

### **2. Transactions & Ingestion**
| Method | Endpoint | Description | Query / Payload |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/transactions` | Fetch user transactions (paginated) | `?page=1&limit=20&category=` |
| `POST` | `/api/transactions` | Manually log single transaction | `{ "amount", "date", "description", "category_id" }` |
| `POST` | `/api/transactions/upload-csv` | Bulk upload bank CSV statement | `multipart/form-data` (`file`) |
| `DELETE` | `/api/transactions/:id` | Delete specific transaction | `Transaction ID param` |

### **3. Financial Health & Analytics**
| Method | Endpoint | Description | Query / Payload |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/health-score` | Compute overall 0–100 wellness score | *None (Authenticated)* |
| `GET` | `/api/insights/summary` | Top categories, monthly trends & spikes | `?month=08&year=2026` |
| `GET` | `/api/budgets` | Get category budgets vs actuals | *None (Authenticated)* |
| `POST` | `/api/budgets` | Set category monthly budget limit | `{ "category_id", "budget_limit" }` |

---

## 🗄️ Database Details & Schema

SpenSight runs on a normalized PostgreSQL schema designed for tenant isolation:

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color_code VARCHAR(10) DEFAULT '#3b82f6',
    icon_name VARCHAR(50) DEFAULT 'wallet'
);

-- 3. Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Budgets Table
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    budget_limit NUMERIC(12, 2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    UNIQUE(user_id, category_id, month, year)
);
```

## 🖼️ Screenshots & Live Deployment

### 🌐 Live Production Link
* **Production URL:** [https://hackinmotion-ricr-him-1182.onrender.com/login.html](https://hackinmotion-ricr-him-1182.onrender.com/login.html)
* **Presentation Deck:** [`presentation.pptx`](./presentation.pptx)
* **Architecture Flowchart:** [`architecture-diagram.png`](./architecture-diagram.png)

---

### 📸 Application Interface Gallery

<div align="center">

#### 📊 Main Financial Dashboard & Analytics Overview
<img src="./screenshots/dashboard.jpeg" alt="SpenSight Main Dashboard" width="850">
<br><br>
<img src="./screenshots/dashboard2.jpeg" alt="Dashboard Analytics & Trends" width="850">

<br><br>

#### 💡 AI Financial Insights & Health Score Breakdown
<img src="./screenshots/insights.png" alt="Insights Overview" width="850">
<br><br>
<img src="./screenshots/insights2.png" alt="Financial Health Score & Recommendations" width="850">
<br><br>
<img src="./screenshots/insights3.png" alt="Deep Spending Pattern Analysis" width="850">

<br><br>

#### 💳 Transaction Ledger & Monthly Budgeting Engine
<img src="./screenshots/transactions.jpeg" alt="Transaction Management & Ingestion" width="850">
<br><br>
<img src="./screenshots/budget.jpeg" alt="Category Budget Allocation" width="850">

<br><br>

#### 🔐 Secure Authentication Portal
<img src="./screenshots/login.jpeg" alt="SpenSight Login View" width="500">

</div>

### 📸 Application Interface Preview
```
+------------------------------------------------------------------------------------+
|  SpenSight Dashboard                                                [ Logout (User) ]|
|  --------------------------------------------------------------------------------  |
|  [ Total Balance ]      [ Total Income ]      [ Total Expense ]    [ Health Score ]|
|    ₹ 1,42,850.00          ₹ 85,000.00           ₹ 42,150.00            82 / 100    |
|  --------------------------------------------------------------------------------  |
|  [ Category Breakdown Doughnut ]           [ Monthly Inflow vs Outflow Bar Chart ] |
|  • Food & Dining (38%)                     • Aug 2026: +85,000 / -42,150           |
|  • Subscriptions (14%)                     • Jul 2026: +80,000 / -51,200           |
|  • Utilities     (22%)                     • Jun 2026: +78,000 / -39,400           |
|  --------------------------------------------------------------------------------  |
|  [ Recent Transactions ]                   [ Cleo AI Insights & Advice ]           |
|  • Swiggy (-₹ 420.00)                      💡 You spent 28% more on dining this    |
|  • Netflix (-₹ 649.00)                        month. Consider setting a ₹6,000 cap.|
+------------------------------------------------------------------------------------+
```

---

## 🔮 Future Scope

1. **Automated Bank API Sync:** Direct integration with Account Aggregator (AA) framework for continuous real-time ledger synchronization.
2. **Predictive Cash Flow Forecasting:** ARIMA and LSTM time-series modeling to forecast month-end balances based on recurring bill schedules.
3. **Multi-Account & Multi-Currency Ledger:** Consolidated tracking across multiple credit cards, crypto assets, and savings folios.
4. **Gamified Savings Milestones:** Personalized financial wellness challenges with automated milestone achievements and peer benchmarking.

---

<div align="center">
  <sub>Built with ❤️ by Team <b>HackInMotion-RICR-HIM-1182</b> for <b>HackInMotion 2026</b> organised by <b>RICR (Raj Institute of Coding and Robotics)<b></sub>
</div>
