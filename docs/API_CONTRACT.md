# SkillBridge AI — Backend API Contract

## 1. Base URL

Development: `http://localhost:5000`

All application APIs use the `/api` prefix, except the root and health endpoints.

## 2. Authentication

Protected endpoints require a JWT in the request header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Authentication flow:

1. Register or log in.
2. Receive the JWT.
3. Send the token in the `Authorization` header for protected endpoints.
4. The authentication middleware verifies the token.

Missing or invalid tokens return `401 Unauthorized`.

## 3. Response Format

Responses use a `success` field.

Example success response:

```json
{
  "success": true,
  "count": 1,
  "matches": []
}
```

Example validation error:

```json
{
  "success": false,
  "message": "Invalid receiver ID"
}
```

The exact response properties depend on the endpoint.

## 4. HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid input or validation failure |
| 401 | Authentication required or token invalid |
| 403 | Access denied |
| 404 | Route or resource not found |
| 409 | Resource conflict, such as duplicate registration |
| 500 | Unexpected server error |

## 5. Health and Root Endpoints

### Root

`GET /`

Returns a backend-running message.

### Health check

`GET /api/health`

Returns server and database status. Returns `200` when the database is connected and `503` otherwise.

## 6. Authentication APIs

All routes are mounted at `/api/auth`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the authenticated user |

The `/me` endpoint requires a valid JWT.

## 7. User Profile APIs

All routes are mounted at `/api/users`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |

Profile updates support the allowed profile fields, including name, bio, location and profile image.

These endpoints require authentication.

## 8. Settings APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/settings` | Get current user settings |
| PUT | `/api/settings` | Update settings |

Supported settings include:

- `emailNotifications`
- `pushNotifications`
- `profileVisibility` (`public` or `private`)

These endpoints require authentication.

## 9. Skill APIs

All routes are mounted at `/api/skills`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/skills` | Get skills |
| GET | `/api/skills?name=Python` | Search skills by name |
| GET | `/api/skills/:id` | Get a skill by ID |

Skill search uses the `name` query parameter.

## 10. Matching APIs

All routes are mounted at `/api/matches`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/matches/recommendations` | Get skill-based recommendations |
| GET | `/api/matches/:id` | Get match/user details |

Both endpoints require authentication.

Recommendations match users who teach a skill the authenticated user wants to learn.

## 11. Skill Request APIs

All routes are mounted at `/api/requests`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/requests` | Create a request |
| GET | `/api/requests` | Get incoming and outgoing requests |
| PUT | `/api/requests/:id/status` | Accept or reject a request |

### Create request body

```json
{
  "receiverId": "VALID_USER_OBJECT_ID",
  "skillToLearn": "Java",
  "message": "I would like to learn Java."
}
```

`receiverId` and `skillToLearn` are required.

### Update request status body

```json
{
  "status": "accepted"
}
```

Allowed statuses: `accepted`, `rejected`.

Only the intended receiver can update the request status.

## 12. Session APIs

All routes are mounted at `/api/sessions`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/sessions` | Create a session |
| GET | `/api/sessions` | Get the authenticated user's sessions |
| PUT | `/api/sessions/:id` | Update or cancel a session |

### Create session body

```json
{
  "learnerId": "VALID_USER_OBJECT_ID",
  "skill": "Java",
  "scheduledAt": "2026-10-25T10:00:00.000Z",
  "durationMinutes": 60,
  "meetingLink": "https://example.com/meeting",
  "notes": "Practice session"
}
```

Required fields: `learnerId`, `skill`, `scheduledAt`.

`durationMinutes` defaults to `60`.

Allowed session statuses: `upcoming`, `completed`, `cancelled`.

Session updates accept only supported fields, including scheduled time, duration, status, meeting link and notes. Mentor and learner IDs cannot be changed through the update endpoint.

These endpoints require authentication.

## 13. Notification APIs

All routes are mounted at `/api/notifications`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark one notification as read |
| PUT | `/api/notifications/read-all` | Mark all notifications as read |

These endpoints require authentication.

## 14. Dashboard API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Get dashboard summary |

The endpoint returns dashboard information for the authenticated user, including relevant request, session and notification statistics.

Authentication is required.

## 15. API Error Handling

Unknown routes return `404 Not Found` with a JSON response.

Example:

```json
{
  "success": false,
  "message": "Route not found: GET /api/invalid-route"
}
```

Unexpected errors are handled by the centralized Express error middleware. Controllers may also handle errors locally.

## 16. API Design Rules

- Use `/api` for application API routes.
- Use plural resource names where appropriate.
- Use MongoDB document IDs for resource identifiers.
- Validate request bodies and resource IDs.
- Protect authenticated endpoints with JWT middleware.
- Keep route definitions, controllers, models and middleware in their respective modules.
- Document an endpoint as implemented only after confirming its route and behavior.
