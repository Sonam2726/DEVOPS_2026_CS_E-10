# SkillBridge-AI-Platform
An AI-Powered Peer Learning & Skill Exchange Platform built with the MERN Stack.

## Local setup

1. Copy `.env.example` to `.env` and update the values for your local environment.
2. Install dependencies in both the server and client folders:
   - `cd server && npm install`
   - `cd client && npm install`
3. Start MongoDB locally or via Docker.
4. Start the backend:
   - `cd server && npm run dev`
5. Start the frontend:
   - `cd client && npm run dev`

## Environment variables

- `PORT` — backend port, default `5000`
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — signing key for authentication tokens
- `CLIENT_URL` — allowed frontend origin for CORS

## Health check

The backend exposes `GET /api/health` to report whether the server is running and whether MongoDB is connected.

## Notes

- Do not commit real credentials or tokens.
- Use local development data only; never run seed or reset scripts against shared or production databases.
