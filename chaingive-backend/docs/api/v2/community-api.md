# ChainGive Community API v2.2.0

## Overview

The Community API provides social features for ChainGive users, including posts, events, interactions, and moderation capabilities.

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Rate Limits

- Community posts: 10 per minute per user
- General requests: 100 per 15 minutes per IP

## Endpoints

### Community Posts

#### GET /api/v2/community/posts

Retrieve community posts with pagination and filtering.

**Query Parameters:**
- `type` (optional): Filter by post type (`story`, `event`, `announcement`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "content": "Post content",
        "type": "story",
        "media": ["url1", "url2"],
        "author": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "avatar-url"
        },
        "likes": 15,
        "commentsCount": 3,
        "isLiked": true,
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### POST /api/v2/community/posts

Create a new community post.

**Request Body:**
```json
{
  "content": "This is my success story...",
  "type": "story",
  "media": ["https://example.com/image.jpg"],
  "eventId": "uuid" // optional, for event-related posts
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "This is my success story...",
    "type": "story",
    "authorId": "uuid",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

#### GET /api/v2/community/posts/:postId

Get a specific community post with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Post content",
    "type": "story",
    "media": ["url"],
    "author": { /* user object */ },
    "likes": 15,
    "commentsCount": 3,
    "isLiked": true,
    "comments": [
      {
        "id": "uuid",
        "content": "Great story!",
        "author": { /* user object */ },
        "createdAt": "2025-01-01T10:30:00Z"
      }
    ],
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

#### POST /api/v2/community/posts/:postId/like

Like or unlike a community post.

**Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 16
  }
}
```

#### POST /api/v2/community/posts/:postId/comments

Add a comment to a post.

**Request Body:**
```json
{
  "content": "This is inspiring!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "This is inspiring!",
    "authorId": "uuid",
    "postId": "uuid",
    "createdAt": "2025-01-01T11:00:00Z"
  }
}
```

### Community Events

#### GET /api/v2/community/events

Retrieve community events with filtering.

**Query Parameters:**
- `filter` (optional): `all`, `my-events`, `attending`
- `type` (optional): Event type filter
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "Community Health Drive",
        "description": "Free medical checkups",
        "eventDate": "2025-12-01",
        "eventTime": "10:00",
        "location": "Community Center",
        "maxAttendees": 100,
        "currentAttendees": 45,
        "eventType": "health",
        "fundraisingGoal": 50000,
        "currentRaised": 25000,
        "creator": { /* user object */ },
        "isAttending": true,
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

#### POST /api/v2/community/events

Create a new community event.

**Request Body:**
```json
{
  "title": "Community Health Drive",
  "description": "Free medical checkups for our community",
  "eventDate": "2025-12-01",
  "eventTime": "10:00",
  "location": "Lagos Community Center",
  "maxAttendees": 100,
  "eventType": "health",
  "fundraisingGoal": 50000,
  "registrationRequired": true,
  "tags": ["health", "community", "medical"]
}
```

#### POST /api/v2/community/events/:eventId/rsvp

RSVP to a community event.

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "uuid",
    "userId": "uuid",
    "status": "attending",
    "currentAttendees": 46
  }
}
```

#### POST /api/v2/community/events/:eventId/donate

Donate to an event's fundraising goal.

**Request Body:**
```json
{
  "amount": 5000,
  "message": "Supporting our community health initiative",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donationId": "uuid",
    "amount": 5000,
    "eventId": "uuid",
    "currentRaised": 30000,
    "fundraisingGoal": 50000
  }
}
```

### Moderation

#### POST /api/v2/community/posts/:postId/report

Report a post for moderation.

**Request Body:**
```json
{
  "reason": "inappropriate",
  "description": "This post contains offensive content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post reported successfully"
}
```

#### POST /api/v2/community/posts/:postId/hide

Hide a post (moderator action).

**Response:**
```json
{
  "success": true,
  "message": "Post hidden successfully"
}
```

### Analytics

#### GET /api/v2/community/analytics/overview

Get community analytics overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPosts": 1250,
    "totalEvents": 45,
    "activeUsers": 890,
    "engagementRate": 0.75,
    "topCategories": [
      { "category": "success_stories", "count": 450 },
      { "category": "events", "count": 320 }
    ],
    "growthMetrics": {
      "postsThisWeek": 45,
      "eventsThisMonth": 12,
      "newUsersThisWeek": 23
    }
  }
}
```

#### GET /api/v2/community/analytics/engagement

Get detailed engagement metrics.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "metrics": {
      "totalInteractions": 2500,
      "averageEngagementRate": 0.68,
      "topPosts": [/* post objects */],
      "engagementByHour": [/* hourly data */],
      "engagementByDay": [/* daily data */]
    }
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed validation errors"],
  "code": "VALIDATION_ERROR"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Data Types

### Post Types
- `story`: Success stories and testimonials
- `event`: Event announcements and updates
- `announcement`: Important community announcements

### Event Types
- `community`: General community gatherings
- `fundraising`: Events with donation goals
- `education`: Educational workshops and seminars
- `health`: Health and wellness events

### Report Reasons
- `spam`: Unsolicited commercial content
- `harassment`: Bullying or harassment
- `inappropriate`: Offensive or inappropriate content
- `misinformation`: False or misleading information

## Webhooks

Community events support webhooks for real-time updates:

- `event.created`: New event created
- `event.rsvp`: User RSVP'd to event
- `event.donation`: Donation made to event
- `post.reported`: Post reported for moderation

Configure webhooks in your application settings to receive these events.