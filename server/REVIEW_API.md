
# SkillBridge AI - Review API Documentation

## Base URL

http://localhost:5000/api/reviews

## 1. Submit a Review

- Method: POST
- Endpoint: /api/reviews
- Authentication: Required (Bearer Token)

### Request Body

{
  "reviewedUser": "USER_ID",
  "skill": "SKILL_ID",
  "rating": 5,
  "comment": "Great teaching experience!"
}

### Success Response

Status: 201 Created

{
  "success": true,
  "message": "Review submitted successfully",
  "data": {}
}

## 2. Fetch Reviews for a User

- Method: GET
- Endpoint: /user/:userId
- Authentication: Not required

Example:

GET /api/reviews/user/USER_ID

Returns reviews received by the specified user, newest first.

## 3. Get Rating Summary

- Method: GET
- Endpoint: /user/:userId/summary
- Authentication: Not required

Example:

GET /api/reviews/user/USER_ID/summary

### Success Response

{
  "success": true,
  "message": "Rating summary fetched successfully",
  "data": {
    "totalReviews": 1,
    "averageRating": 5
  }
}

## Validation Rules

- reviewedUser, skill and rating are required.
- Rating must be an integer between 1 and 5.
- A user cannot review themselves.
- The reviewed user and skill must exist.

## Common HTTP Status Codes

- 200: Request successful
- 201: Review created successfully
- 400: Invalid input or ID
- 404: User or skill not found
- 500: Internal server error
