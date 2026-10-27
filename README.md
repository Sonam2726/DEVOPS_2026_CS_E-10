# SkillBridge-AI-Platform
An AI-Powered Peer Learning & Skill Exchange Platform built with the MERN Stack.

## Local development

1. Copy `.env.example` to `.env` and update the values for your local environment.
2. Install dependencies in both the server and client folders:
   - `cd server && npm install`
   - `cd client && npm install`
3. Start MongoDB locally or via Docker.
4. Start the backend:
   - `cd server && npm run dev`
5. In another terminal, start the frontend:
   - `cd client && npm run dev`

The Vite development server runs on `http://localhost:5173` by default. The
frontend uses `VITE_API_URL` when it is provided; otherwise it falls back to
`http://localhost:5000/api`.

## Production Docker setup

The frontend image uses a multi-stage build:

1. `node:20-alpine` installs the locked dependencies and creates the Vite
   production bundle.
2. `nginx:1.27-alpine` serves the static bundle and falls back to
   `index.html` for React Router routes.

### Run the complete stack with Docker Compose

Set a strong JWT secret in the environment before starting the stack. Do not
commit it to the repository.

PowerShell:

```powershell
$env:JWT_SECRET = "replace-with-a-local-development-secret"
docker compose up --build
```

The services are available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- Backend health: `http://localhost:5001/api/health`
- MongoDB: `mongodb://localhost:27017`

The Compose frontend build receives the browser-reachable API URL
`http://localhost:5001/api` through the non-secret `VITE_API_URL` build
argument. The backend and MongoDB service definitions retain their existing
container ports and volume configuration.

To stop the stack without removing the MongoDB volume:

```powershell
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to delete
the MongoDB data volume.

### Build and run the frontend image independently

```powershell
docker build `
  --build-arg VITE_API_URL=http://localhost:5001/api `
  -t skillbridge-frontend ./client
docker run --rm -p 3000:80 skillbridge-frontend
```

For a deployed environment, replace the build argument with the public API
origin that the browser can reach. Vite variables are embedded at build time,
so rebuild the image after changing `VITE_API_URL`.

### Frontend troubleshooting

- If the app loads but API requests fail, verify that `VITE_API_URL` points to
  the browser-reachable backend URL and includes the `/api` path.
- If a refreshed React Router URL returns a 404, confirm the frontend image is
  using `client/nginx.conf`; its `try_files` rule provides the SPA fallback.
- If Compose refuses to start, set `JWT_SECRET` in the shell or a local,
  untracked project `.env` file.
- The frontend image health endpoint is `http://localhost:3000/healthz`.

## Environment variables

- `PORT` — backend port inside the container, default `5000`
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — signing key for authentication tokens
- `CLIENT_URL` — allowed frontend origin for CORS
- `VITE_API_URL` — frontend build-time API base URL, for example
  `http://localhost:5001/api`

Never place secrets in `VITE_*` variables: Vite embeds them in the browser
bundle.

## Backend Dockerfile review

The existing `server/Dockerfile` was not overwritten. It is compatible with
the current Compose service, but these improvements remain recommended for a
future backend-focused change:

- use `npm ci --omit=dev` for reproducible production installs;
- run the service as a non-root user;
- add a container healthcheck for `/api/health`;
- keep `JWT_SECRET` and other runtime configuration injected by the
  environment rather than copied into the image.

## Health check

The backend exposes `GET /api/health` to report whether the server is running
and whether MongoDB is connected.

## Notes

- Do not commit real credentials or tokens.
- `server/seed/skills.js` currently provides only an exported skills data
  module. No executable seed or reset workflow is currently provided.
- Use local development data only if a seed or reset workflow is added later;
  never run such operations against shared or production databases.
