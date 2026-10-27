# SkillBridge AI — API Documentation

## 1. Overview

SkillBridge AI is a skill-sharing platform where users can offer skills, discover skills, connect with other users, schedule sessions, exchange messages, and submit reviews.

**Base URL:** `http://localhost:5000`

**API Prefix:** `/api`

**Content-Type:** `application/json`

## 2. Authentication

Protected endpoints require a valid authentication token.

Add the following header to protected requests:

```http
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

Register or log in to obtain a token.

Public endpoints do not require authentication.

## 3. Health and Server Status

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/` | No | Check whether the backend is running |
| GET | `/api/health` | No | Check server and database readiness |

## 4. Authentication APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a user |
| POST | `/api/auth/login` | No | Log in |
| GET | `/api/auth/me` | Yes | Get the authenticated user |

### Register

**POST** `/api/auth/register`

Request fields depend on the registration controller.

### Login

**POST** `/api/auth/login`

Request fields depend on the login controller.

### Current User

**GET** `/api/auth/me`

Requires a valid Bearer token.

## 5. Skills APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/skills` | Yes | Create a skill |
| GET | `/api/skills` | No | List skills |
| GET | `/api/skills/mine` | Yes | Get the authenticated user's skills |
| GET | `/api/skills/search` | No | Search skills |
| GET | `/api/skills/:id` | No | Get a skill by ID |

## 6. Matching APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/matches/recommendations` | Yes | Get recommendations |
| GET | `/api/matches/:id` | Yes | Get match details |

## 7. Requests APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/requests` | Yes | Send a request |
| GET | `/api/requests` | Yes | Get the user's requests |
| PUT | `/api/requests/:id/status` | Yes | Update request status |

## 8. Sessions APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/sessions` | Yes | Create a session |
| GET | `/api/sessions` | Yes | Get the authenticated user's sessions |
| PUT | `/api/sessions/:id` | Yes | Update a session |

### Create Session

**POST** `/api/sessions`

Example request body:

```json
{
  "requestId": "VALID_REQUEST_OBJECT_ID",
  "scheduledAt": "2026-11-05T10:00:00.000Z",
  "durationMinutes": 60,
  "meetingLink": "https://example.com/meeting",
  "notes": "Python learning session"
}
```

The request ID must refer to an eligible accepted request. The scheduled time must be in the future.

## 9. Reviews APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/reviews` | Yes | Submit a review |
| GET | `/api/reviews/user/:userId` | No | Get reviews for a user |
| GET | `/api/reviews/user/:userId/summary` | No | Get the user's rating summary |

### Submit Review

**POST** `/api/reviews`

Example request body:

```json
{
  "reviewedUser": "VALID_USER_OBJECT_ID",
  "skill": "VALID_SKILL_OBJECT_ID",
  "rating": 5,
  "comment": "Great teaching experience!"
}
```

The rating must be an integer from 1 to 5. The user cannot review themselves.

## 10. Notifications APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/notifications` | Yes | Get notifications |
| PUT | `/api/notifications/read-all` | Yes | Mark all notifications as read |
| PUT | `/api/notifications/:id/read` | Yes | Mark one notification as read |

## 11. Dashboard API

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/dashboard` | Yes | Get dashboard data |

## 12. User APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/users/profile` | Yes | Get the user's profile |
| PUT | `/api/users/profile` | Yes | Update the user's profile |
| PUT | `/api/users/skills` | Yes | Update skills to teach and learn |

## 13. Settings APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/settings` | Yes | Get user settings |
| PUT | `/api/settings` | Yes | Update user settings |

## 14. Chat API

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/chat` | Yes | Send a chat message |

## 15. Conversations APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/conversations` | Yes | List conversations |
| POST | `/api/conversations` | Yes | Create a conversation |
| GET | `/api/conversations/:id/messages` | Yes | Get conversation messages |
| POST | `/api/conversations/:id/messages` | Yes | Send a message in a conversation |
| PATCH | `/api/conversations/:id/read` | Yes | Mark conversation messages as read |

## 16. Common HTTP Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Invalid or missing input |
| 401 | Authentication missing or invalid |
| 403 | Authenticated user is not allowed to perform the action |
| 404 | Resource or route not found |
| 500 | Unexpected server error |
| 503 | Health check reports the database is unavailable |

Actual status codes depend on each controller's implementation.

## 17. Error Response Format

Example:

```json
{
  "success": false,
  "message": "Error description"
}
```

The exact error message depends on the endpoint and the validation that failed.

## 18. Existing Review Documentation

Additional review-specific information is documented in `REVIEW_API.md`.

## 19. Important Notes

- Replace placeholder IDs with valid MongoDB ObjectIds.
- Replace `<YOUR_TOKEN>` with a valid token obtained through login.
- Do not commit passwords, access tokens, or database credentials.
- Request body fields and validation rules should be checked against the relevant controller.
- This documentation lists endpoints registered in the route files. It does not replace controller-level validation or integration testing.