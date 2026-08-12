# SpenSight Developer Onboarding Runbook

## System Requirements
- Node.js >= 18.0.0
- PostgreSQL database (Local or Neon Serverless)
- Redis instance (Local or Docker container)

## Quickstart Guide

### 1. Clone and Navigate
git clone https://github.com/RIITKAGARWAL/HackInMotion-RICR-HIM-1182.git
cd HackInMotion-RICR-HIM-1182

### 2. Install Backend Dependencies
cd backend
npm install

### 3. Configure Environment Variables
cp .env.example .env
# Populate .env with PostgreSQL connection string and Redis host details

### 4. Initialize and Seed Database
node scripts/initDb.js
node scripts/seed.js

### 5. Start Development Server
npm start