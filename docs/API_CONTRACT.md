# SkillBridge AI — Backend API Contract

This document reflects the routes mounted by `server/server.js` and the
controller behavior in the current source.

## Base URL and configuration

Development base URL: `http://localhost:5000`

Application routes use the `/api` prefix. `GET /` and `GET /api/health` are
also available.

The server reads `PORT` (default `5000`), `MONGO_URI` (default
`mongodb://127.0.0.1:27017/skillbridge`), `JWT_SECRET` (required), and the
optional `CLIENT_URL`. CORS accepts `CLIENT_URL` when set, plus
`http://localhost:5173`, `http://127.0.0.1:5173`, and
`http://localhost:3000`; credentialed CORS is enabled. Requests without an
`Origin` header are accepted; other browser origins are rejected by the CORS
policy. The frontend reads `VITE_API_URL` for its API base URL and otherwise
uses `http://localhost:5000/api`.

## Authentication and common responses

Protected routes require the JWT returned by Login:

```http
Authorization: Bearer <token>
```

Missing or invalid tokens return `401` with a JSON error. Authenticated routes
may also return `403` when the account or requested action is not permitted.

Most API responses contain `success`. Error responses generally contain
`success: false` and a `message`; response properties vary by endpoint.
Unexpected server errors return a generic message from the centralized error
handler or a controller-specific safe message.

## Root and health

### `GET /`

Returns a backend-running message:

```json
{
  "success": true,
  "message": "SkillBridge AI Backend is running successfully!"
}
```

### `GET /api/health`

Returns `200` when MongoDB is connected and `503` otherwise. The response
contains `status`, `server`, and `database` fields.

## Authentication — `/api/auth`

| Method | Endpoint | Auth | Behavior |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Authenticate and issue a JWT |
| GET | `/api/auth/me` | Yes | Return the authenticated account |

Register request:

```json
{
  "name": "A learner",
  "email": "learner@example.com",
  "password": "example-password"
}
```

Register returns `201` with `data.user`. A duplicate email found by the
controller returns `409`; missing required fields return `400`.

Login accepts `email` and `password`. A successful response (`200`) contains
`data.token` and `data.user`. Invalid credentials return `401`; an inactive
account returns `403`.

`GET /api/auth/me` returns the user in `data.user`; a missing account returns
`404`.

## Users — `/api/users`

All listed routes require authentication.

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/api/users/profile` | Return the profile and populated teaching/learning skills in `data.profile` |
| PUT | `/api/users/profile` | Update supported profile fields |
| PUT | `/api/users/skills` | Update `skillsToTeach` and/or `skillsToLearn` |

Profile update fields are `name`, `email`, `bio`, `location`, and
`profileImage`. Names and emails are validated; email changes must remain
unique. Role, password, user ID, and account activation state are not
profile-update fields. Successful updates return `data.profile`. The skills
update accepts arrays of skill IDs and returns `data.skillsToTeach` and
`data.skillsToLearn`.

## Settings — `/api/settings`

Both routes require authentication.

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/api/settings` | Return settings in `data.settings` |
| PUT | `/api/settings` | Update one or more supported settings |

Supported update fields are `emailNotifications` (boolean),
`pushNotifications` (boolean), and `profileVisibility` (`public` or
`private`). Successful updates return `data.settings`. An empty or invalid
update returns `400`.

## Skills — `/api/skills`

| Method | Endpoint | Auth | Behavior |
|---|---|---|---|
| POST | `/api/skills` | Yes | Create a skill owned by the authenticated user |
| GET | `/api/skills` | No | List/filter skills with pagination |
| GET | `/api/skills/search?name=Python` | No | Search by required name text |
| GET | `/api/skills/:id` | No | Fetch a skill by MongoDB ID |
| GET | `/api/skills/mine` | Yes | List skills published by the authenticated user |

Create request:

```json
{
  "name": "Python",
  "description": "Python fundamentals",
  "category": "Programming",
  "level": "Beginner"
}
```

The category must be one of `Programming`, `Data Science`,
`Web Development`, `Design`, `Business`, `Languages`, or `Other`. The level
must be `Beginner`, `Intermediate`, or `Advanced`. A successful create returns
`201` and the created skill in `data`.

The list endpoint accepts `name`, `category`, and `level` filters, along with
these pagination and sorting query parameters:

| Parameter | Default | Behavior |
|---|---:|---|
| `page` | `1` | Page number; values below 1 are clamped to 1, and unparsable values use the default |
| `limit` | `10` | Page size; values are clamped to 1–50, and unparsable values use the default |
| `sort` | `name` | Supported fields: `name`, `-name`, `createdAt`, `-createdAt`, `level`, `-level`; unsupported values use `name` |

List response:

```json
{
  "success": true,
  "message": "Skills fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

The `/search` endpoint requires a non-empty `name` query parameter and returns
matching skills in `data`; it does not return pagination metadata. A malformed
skill ID returns `400`; a valid but missing skill returns `404`.

## Matches — `/api/matches`

Both routes require authentication.

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/api/matches/recommendations` | Return users who teach a skill the current user wants to learn, as `matches` with `count` |
| GET | `/api/matches/:id` | Return a user in `user` |

An invalid match/user ID returns `400`; a valid ID with no user returns `404`.
Passwords are excluded from these responses.

## Requests — `/api/requests`

All routes require authentication.

| Method | Endpoint | Behavior |
|---|---|---|
| POST | `/api/requests` | Send a learning request and notify the skill owner |
| GET | `/api/requests` | Return incoming and outgoing requests with pagination |
| PUT | `/api/requests/:id/status` | Accept or reject an incoming pending request |

Create request body:

```json
{
  "receiverId": "VALID_USER_OBJECT_ID",
  "skillToLearn": "Java",
  "message": "I would like to learn Java."
}
```

`receiverId` must identify the owner of a matching skill, and
`skillToLearn` is required. `message` is optional. A successful request
returns `201` with the created item in `request`. Invalid input returns `400`;
an unavailable skill/owner returns `404`; a duplicate pending request returns
`409`.

Request status body:

```json
{
  "status": "accepted"
}
```

Allowed statuses are `accepted` and `rejected`. Only the intended receiver can
resolve the pending request. Success returns the updated item in `request`;
invalid input returns `400`, an unknown or unauthorized request returns
`404`, and a previously resolved request returns `409`.

The list endpoint accepts `page` (default `1`) and `limit` (default `10`,
capped at `50`). Values below 1 are clamped to 1; unparsable values use the
default. Both incoming and outgoing results use the requested page and limit.
The response fields are `incoming`, `outgoing`, and `pagination`:

```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalIncoming": 0,
    "totalOutgoing": 0,
    "totalIncomingPages": 0,
    "totalOutgoingPages": 0
  },
  "incoming": [],
  "outgoing": []
}
```

## Sessions — `/api/sessions`

All routes require authentication.

| Method | Endpoint | Behavior |
|---|---|---|
| POST | `/api/sessions` | Schedule one session for an accepted request |
| GET | `/api/sessions` | Return sessions involving the authenticated user |
| PUT | `/api/sessions/:id` | Update a session or its status |

Session creation requires an **accepted request ID** belonging to the
authenticated user. It does not accept `learnerId` or a client-selected skill;
the server derives mentor, learner, and skill from the request.

Create session body:

```json
{
  "requestId": "ACCEPTED_REQUEST_OBJECT_ID",
  "scheduledAt": "2026-10-27T10:00:00.000Z",
  "durationMinutes": 60,
  "meetingLink": "https://example.com/meeting",
  "notes": "Practice session"
}
```

`requestId` and `scheduledAt` are required. The scheduled time must be in the
future. `durationMinutes` defaults to `60` and must be positive; `meetingLink`
and `notes` are optional strings. Success returns `201` with the session in
`session`, for example:

```json
{
  "success": true,
  "session": {
    "_id": "SESSION_OBJECT_ID",
    "request": "ACCEPTED_REQUEST_OBJECT_ID",
    "mentor": "MENTOR_USER_OBJECT_ID",
    "learner": "LEARNER_USER_OBJECT_ID",
    "skill": "Java",
    "scheduledAt": "2026-10-27T10:00:00.000Z",
    "durationMinutes": 60,
    "status": "upcoming",
    "meetingLink": "https://example.com/meeting",
    "notes": "Practice session",
    "createdAt": "2026-10-20T12:00:00.000Z",
    "updatedAt": "2026-10-20T12:00:00.000Z",
    "__v": 0
  }
}
```

Invalid input returns `400` with `success: false` and a `message`; a
missing/unauthorized request or unavailable skill returns `404`; a request
that is not accepted or already has a session returns `409`.

Session listing returns `success`, `count`, and `sessions`, sorted by
`scheduledAt` ascending.

Session updates accept one or more of `scheduledAt`, `durationMinutes`,
`status`, `meetingLink`, and `notes`. Mentor and learner IDs are not update
fields. Allowed statuses are `upcoming`, `completed`, and `cancelled`. Only
the mentor may mark a session completed, and only after its scheduled time.
Success returns the updated object in `session`; invalid input/ID returns
`400`, missing or unauthorized session returns `404`, an invalid state
transition returns `409`, and a learner attempting to mark completion returns
`403`.

## Chat — `/api/chat`

`POST /api/chat` requires authentication. The request body contains a `messages`
array with 1–20 items. Each item must have role `user` or `assistant` and
non-empty string `content` no longer than 2,000 characters; the last item must
be from the user.

Successful response: `{ "success": true, "reply": "..." }`. Invalid input
returns `400`. An unavailable or failing local AI service returns `502` with a
safe message.

## Human conversations — `/api/conversations`

All human conversation routes require authentication. A conversation can be
created only between active users who have an accepted learning request in
either direction.

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/api/conversations` | List conversations with participant, latest message, timestamp, and unread count |
| POST | `/api/conversations` | Create or return a conversation for `{ "participantId": "..." }` |
| GET | `/api/conversations/:id/messages` | Return persisted history and confirm delivery for addressed messages |
| POST | `/api/conversations/:id/messages` | Persist `{ "content": "...", "clientMessageId": "..." }`; duplicate IDs are safe to retry |
| PATCH | `/api/conversations/:id/read` | Mark only unread messages in this conversation addressed to the user as read |

Conversation membership is checked on every read, send, and read-receipt
operation. The human chat uses short polling for updates; the AI Tutor remains
separate through `/api/chat` and never shares human messages.

## Notifications — `/api/notifications`

All routes require authentication.

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/api/notifications` | Return notifications in `data.notifications` |
| PUT | `/api/notifications/:id/read` | Mark one of the user's notifications as read |
| PUT | `/api/notifications/read-all` | Mark all of the user's unread notifications as read |

Mark-one success returns the updated item in `data.notification`; mark-all
success returns `data.updatedCount`. A missing mark-one notification returns
`404`. Learning-request notifications include the related request ID in the
optional `request` field, allowing the frontend to open the corresponding
incoming or outgoing request. Older notifications without that field fall back
to the relevant Requests list.

## Dashboard — `/api/dashboard`

`GET /api/dashboard` requires authentication. Success returns `data.user`,
`data.statistics` (skills, requests, sessions, and notification totals), and
`data.recentActivity` (up to five recent notifications).

## Reviews — `/api/reviews`

| Method | Endpoint | Auth | Behavior |
|---|---|---|---|
| POST | `/api/reviews` | Yes | Submit a review |
| GET | `/api/reviews/user/:userId` | No | Return received reviews, newest first, in `data` |
| GET | `/api/reviews/user/:userId/summary` | No | Return review count and average rating in `data` |

Review submission requires `reviewedUser`, `skill`, and integer `rating` from
1 to 5. `comment` is optional and limited to 500 characters by the model. The
reviewer cannot review themselves; the reviewed user and skill must exist. A
successful submission returns `201` and the review in `data`. Invalid
input/IDs return `400`; a missing user or skill returns `404`.

The current review API accepts only `reviewedUser`, `skill`, `rating`, and
optional `comment`. It does not accept or associate a `session` or `match`
with the persisted review. The frontend uses completed-session information to
derive the other participant and the skill before submitting these fields, but
the resulting review remains unlinked to that session under the current API.

## Errors and status codes

Common statuses returned by the current handlers:

| Status | Meaning |
|---|---|
| 200 | Successful read or update |
| 201 | Resource created |
| 400 | Invalid request body, field, or resource ID |
| 401 | Authentication required or token invalid |
| 403 | Account inactive or action forbidden |
| 404 | Route or resource not found |
| 409 | Conflict, such as duplicate registration/request/session or invalid state |
| 502 | Local AI service unavailable |
| 503 | Health check reports MongoDB disconnected |
| 500 | Unexpected server error |

Unknown routes return a JSON `404`, for example:

```json
{
  "success": false,
  "message": "Route not found: GET /api/invalid-route"
}
```

The centralized error handler returns a generic message for unexpected
`500` errors. Controllers may return endpoint-specific safe error messages.
