# Low Level Design & OpenAPI Fragment

## Overview
This document describes the backend architecture and API for the BrainBolt quiz application.

## Endpoints

### GET /v1/quiz/next
Fetch the next question for the user based on adaptive difficulty.

**Headers:**
- `x-user-id`: User ID (required)

**Response:**
```json
{
  "questionId": "uuid",
  "difficulty": 1,
  "prompt": "Question text",
  "choices": ["A", "B", "C", "D"],
  "currentDifficulty": 1,
  "currentScore": 100,
  "currentStreak": 2
}
```

### POST /v1/quiz/answer
Submit an answer. Idempotent.

**Headers:**
- `x-user-id`: User ID (required)

**Body:**
```json
{
  "questionId": "uuid",
  "answer": "selected answer value",
  "answerIdempotencyKey": "unique-client-generated-key"
}
```

**Response:**
```json
{
  "correct": true,
  "newDifficulty": 2,
  "newStreak": 3,
  "scoreDelta": 10,
  "totalScore": 110,
  "stateVersion": 5
}
```

### GET /v1/quiz/metrics
Get current user metrics.

**Headers:**
- `x-user-id`: User ID (required)

**Response:**
```json
{
  "userId": "u1",
  "currentDifficulty": 1,
  "streak": 0,
  "totalScore": 0,
  "lastQuestionId": null,
  "lastAnswerAt": null,
  "stateVersion": 0
}
```

### GET /v1/leaderboard/score
Get top 10 users by score.

**Response:**
```json
[
  { "userId": "u1", "score": 1500, "rank": 1 },
  ...
]
```

### GET /v1/leaderboard/streak
Get top 10 users by streak.

**Response:**
```json
[
  { "userId": "u2", "streak": 15, "rank": 1 },
  ...
]
```

## Database Schema
Prisma schema: `packages/backend/prisma/schema.prisma`

## Redis Keys
- `user_state:{userId}`: JSON, TTL 60s
- `leaderboard:score`: ZSET
- `leaderboard:streak`: ZSET
