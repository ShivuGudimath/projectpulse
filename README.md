# ProjectPulse

ProjectPulse is a full-stack project monitoring platform designed for Indian government, infrastructure, rural development, and public works project oversight.

## Features

- Role-based dashboard for Admin, Project Officer, Contractor, and Citizen
- Project and milestone tracking
- Budget and expenditure monitoring
- Map-based location monitoring
- AI-inspired risk scoring
- Alerts and notifications
- Citizen reporting and feedback module
- Project reports and export support

## Demo credentials

- Admin: admin@projectpulse.demo / admin123
- Project Officer: officer@projectpulse.demo / officer123
- Contractor: contractor@projectpulse.demo / contractor123
- Citizen: citizen@projectpulse.demo / citizen123

## Run locally

1. Backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

2. Frontend:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. Open http://localhost:5173

## API endpoints

- POST /api/auth/login
- GET /api/projects
- GET /api/projects/:id
- POST /api/projects
- GET /api/analytics/dashboard
- GET /api/alerts
- POST /api/feedback

## Notes

- Demo data is simulated for hackathon presentation and is not official government data.
- Risk prediction uses a transparent rule-based approach that can later be replaced with ML analytics.
