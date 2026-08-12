# SpenSight System Architecture

## Architecture Flow

```text
[ Client Browser ] ──(HTTP/REST)──► [ Express API Gateway ]
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     [ PostgreSQL Database ]                       [ BullMQ Queue / Redis ]
  (User, Categories, Budgets)                                 │
                                                              ▼
                                                   [ CSV Background Worker ]
                                                              │
                                                              ▼
                                                   [ Categorized Analytics ]