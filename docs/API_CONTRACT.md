# SkillBridge AI - Backend API Contract

## 1. Base URL

Development:

http://localhost:5000/api

All backend APIs use the `/api` prefix.

---

## 2. Authentication

SkillBridge AI will use JWT-based authentication.

### Authentication Flow

Register/Login  
↓  
Validate credentials  
↓  
Generate JWT  
↓  
Client stores token  
↓  
Protected API request  
↓  
Authorization: Bearer <token>  
↓  
JWT verification middleware  
↓  
Controller

### Protected Request Header

```http
Authorization: Bearer <JWT_TOKEN>
```

Protected endpoints must reject requests without a valid JWT.

---

## 3. Standard Success Response

All successful API responses should follow:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

---

## 4. Standard Error Response

All API errors should follow:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Validation errors may include:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

---

## 5. HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Bad request / validation error |
| 401 | Authentication required / invalid token |
| 403 | Access denied |
| 404 | Resource not found |
| 409 | Conflict |
| 500 | Internal server error |

---

## 6. Authentication APIs

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

### Forgot Password

```http
POST /api/auth/forgot-password
```

### Reset Password

```http
POST /api/auth/reset-password
```

### Logout

```http
POST /api/auth/logout
```

### Current User

```http
GET /api/auth/me
```

---

## 7. User APIs

### Get Profile

```http
GET /api/users/profile
```

### Update Profile

```http
PUT /api/users/profile
```

### Get Settings

```http
GET /api/users/settings
```

### Update Settings

```http
PUT /api/users/settings
```

---

## 8. Skill APIs

### Get Skills

```http
GET /api/skills
```

### Get Skill by ID

```http
GET /api/skills/:id
```

### Create Skill

```http
POST /api/skills
```

### Update Skill

```http
PUT /api/skills/:id
```

### Delete Skill

```http
DELETE /api/skills/:id
```

### Search Skills

```http
GET /api/skills/search
```

---

## 9. Skill Request APIs

### Create Request

```http
POST /api/requests
```

### Get Requests

```http
GET /api/requests
```

### Get Request by ID

```http
GET /api/requests/:id
```

### Update Request

```http
PUT /api/requests/:id
```

### Delete Request

```http
DELETE /api/requests/:id
```

---

## 10. Matching APIs

### Get Matches

```http
GET /api/matches
```

### Get Match Details

```http
GET /api/matches/:id
```

### Accept Match

```http
POST /api/matches/:id/accept
```

### Reject Match

```http
POST /api/matches/:id/reject
```

---

## 11. Session APIs

### Create Session

```http
POST /api/sessions
```

### Get Sessions

```http
GET /api/sessions
```

### Get Session by ID

```http
GET /api/sessions/:id
```

### Update Session

```http
PUT /api/sessions/:id
```

### Delete Session

```http
DELETE /api/sessions/:id
```

---

## 12. Review APIs

### Create Review

```http
POST /api/reviews
```

### Get User Reviews

```http
GET /api/reviews/user/:userId
```

### Get Session Reviews

```http
GET /api/reviews/session/:sessionId
```

### Update Review

```http
PUT /api/reviews/:id
```

### Delete Review

```http
DELETE /api/reviews/:id
```

---

## 13. Message APIs

### Get Conversations

```http
GET /api/messages/conversations
```

### Get Messages with a User

```http
GET /api/messages/:userId
```

### Send Message

```http
POST /api/messages
```

### Mark Message as Read

```http
PUT /api/messages/:id/read
```

### Delete Message

```http
DELETE /api/messages/:id
```

---

## 14. Notification APIs

### Get Notifications

```http
GET /api/notifications
```

### Mark Notification as Read

```http
PUT /api/notifications/:id/read
```

### Mark All Notifications as Read

```http
PUT /api/notifications/read-all
```

### Delete Notification

```http
DELETE /api/notifications/:id
```

---

## 15. API Naming Rules

- All APIs use the `/api` prefix.
- Resource names use plural nouns.
- Resource IDs use MongoDB `_id`.
- HTTP methods should represent the operation.
- Protected APIs require JWT authentication.
- API responses must follow the common success/error format.
- Controllers contain business logic.
- Routes define endpoints.
- Models contain MongoDB/Mongoose schemas.
- Middleware handles authentication and common errors.