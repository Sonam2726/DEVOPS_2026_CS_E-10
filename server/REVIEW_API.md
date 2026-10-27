# SkillBridge AI — Review API

This document reflects the routes in `routes/reviewRoutes.js` and behavior in
`controllers/reviewController.js`.

## Base URL

`http://localhost:5000/api/reviews`

## Submit a review

- **Method:** `POST`
- **Endpoint:** `/`
- **Authentication:** Required; send `Authorization: Bearer <token>`.

Request body:

```json
{
  "reviewedUser": "VALID_USER_OBJECT_ID",
  "skill": "VALID_SKILL_OBJECT_ID",
  "rating": 5,
  "comment": "Great teaching experience!"
}
```

`reviewedUser`, `skill`, and `rating` are required. IDs must be valid MongoDB
ObjectIds. `rating` must be an integer from 1 to 5. `comment` is optional and
must be a string with a maximum of 500 characters per the review model. A user
cannot review themselves, and the reviewed user and skill must exist.

The submission contract accepts only `reviewedUser`, `skill`, `rating`, and
optional `comment`. It does not accept or associate a `session` or `match`
with the persisted review. The frontend uses completed-session information to
derive the reviewed participant and skill before submitting the request, but
the saved review is not linked to that session under the current API. The
optional `session` and `match` fields in the review model therefore remain
`null` for reviews created through this controller.

Successful response (`201 Created`):

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "_id": "REVIEW_OBJECT_ID",
    "reviewer": "REVIEWER_USER_OBJECT_ID",
    "reviewedUser": "REVIEWED_USER_OBJECT_ID",
    "skill": "SKILL_OBJECT_ID",
    "match": null,
    "session": null,
    "rating": 5,
    "comment": "Great teaching experience!",
    "createdAt": "2026-10-20T12:00:00.000Z",
    "updatedAt": "2026-10-20T12:00:00.000Z",
    "__v": 0
  }
}
```

The `data` value contains the created review document. The timestamp values
and generated IDs in this example are illustrative.

## Fetch reviews for a user

- **Method:** `GET`
- **Endpoint:** `/user/:userId`
- **Authentication:** Not required.

Example: `GET /api/reviews/user/USER_OBJECT_ID`

Returns `200` with reviews in `data`, populated with reviewer name, reviewed
user name, and skill name, sorted newest first. An invalid ID returns `400`;
a valid ID for a user that does not exist returns `404`.

## Get a user's rating summary

- **Method:** `GET`
- **Endpoint:** `/user/:userId/summary`
- **Authentication:** Not required.

Example: `GET /api/reviews/user/USER_OBJECT_ID/summary`

Successful response (`200`):

```json
{
  "success": true,
  "message": "Rating summary fetched successfully",
  "data": {
    "totalReviews": 1,
    "averageRating": 5
  }
}
```

An invalid user ID returns `400`; a valid ID for a user that does not exist
returns `404`.

## Common status codes

- `200`: Read succeeded.
- `201`: Review created.
- `400`: Missing or invalid input, ID, or rating.
- `401`: Missing or invalid authentication for review submission.
- `404`: Reviewed user or skill not found.
- `500`: Unexpected server error.
