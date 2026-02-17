# 🧠 BrainBolt - Adaptive Quiz Platform

> An intelligent quiz application with adaptive difficulty, real-time leaderboards, and AI-powered question generation.

## 🎥 Demo Video

> **📹 Demo video will be added to the root folder before final submission.**
> 
> The video will include:
> - Complete feature walkthrough (adaptive difficulty, leaderboards, streak tracking)
> - Frontend UI demonstration
> - Backend codebase walkthrough
> - Database and API integration overview

---

## 🚀 Quick Start

### Single-Command Startup (Docker)

```bash
# Clone the repository
git clone <repository-url>
cd BrainBolt

# Start everything with one command
docker-compose up -d
```

**Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **Database**: PostgreSQL on port 5432
- **Cache**: Redis on port 6379

### Alternative: Local Development

```bash
# Install dependencies
npm install

# Terminal 1: Start backend
cd packages/backend
npm run dev  # Runs on http://localhost:3002

# Terminal 2: Start frontend
cd packages/frontend
npm run dev  # Runs on http://localhost:3000
```

**Prerequisites for local dev:**
- Node.js 18+
- PostgreSQL 15
- Redis 7

---

## ✨ Features Implemented

### Core Functionality
- ✅ **Adaptive Difficulty System**: Questions automatically adjust from Level 1-20 based on performance
- ✅ **Streak Tracking**: Current streak with automatic 24-hour decay mechanism
- ✅ **Real-time Leaderboards**: Live rankings by score and streak using Redis
- ✅ **500 Curated Questions**: Across 20 difficulty levels (~25 questions per level)
- ✅ **Score Calculation**: Dynamic scoring based on difficulty and streak multipliers
- ✅ **User Metrics**: Comprehensive statistics including accuracy and performance trends

### Advanced Features
- ✅ **Gemini AI Integration** (Optional): Infinite AI-generated questions with automatic fallback
- ✅ **Rate Limiting**: Redis-based protection (30/100/200 requests per minute by endpoint)
- ✅ **Idempotency**: Prevents duplicate answer submissions
- ✅ **Redis Caching**: User state and question pools for performance
- ✅ **Database Indexing**: 15+ indexes for optimized queries
- ✅ **Health Checks**: Monitoring for all services (Backend, PostgreSQL, Redis)

### Frontend Features
- ✅ **Modern UI**: Vibrant gradients with smooth animations
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Real-time Feedback**: Toast notifications for correct/incorrect answers
- ✅ **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- ✅ **Performance**: React.memo, useCallback optimization throughout

### Backend Features
- ✅ **RESTful API**: 5 endpoints (quiz, answer, metrics, leaderboard, health)
- ✅ **Prisma ORM**: Type-safe database access
- ✅ **Error Handling**: Graceful degradation with detailed error responses
- ✅ **Input Validation**: Comprehensive request validation
- ✅ **CORS Support**: Configurable for production deployment

---

## 🎮 How It Works

### 1. User Flow
```
Start Quiz → Answer Question → Get Answer → Update Score/Streak → Next Question
                                    ↓
                            Difficulty Adjusts Based on Performance
```

### 2. Adaptive Algorithm
- **Momentum Calculation**: Analyzes last 3 answers
- **Streak Tracking**: Consecutive correct answers
- **Difficulty Adjustment**:
  - ✅ 2+ correct in last 3 → Increase difficulty
  - ❌ 2+ wrong in last 3 → Decrease difficulty
  - Maintains current level otherwise

### 3. Scoring System
```
Base Score = Difficulty × 10
Streak Multiplier = 1.0 + (min(streak, 5) × 0.2)
Final Score = Base Score × Streak Multiplier
```

**Example**: Level 5 question with 3-streak = 50 × 1.6 = 80 points

### 4. Question Sources
- **Primary**: 500 database questions (Levels 1-20)
- **Optional**: Gemini AI for infinite questions
- **Fallback**: Automatic switch to database if AI unavailable

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Next.js   │────▶│   Express   │────▶│  PostgreSQL  │
│  Frontend   │     │   Backend   │     │   Database   │
│  (Port 3000)│     │  (Port 3002)│     │  (Port 5432) │
└─────────────┘     └─────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Redis     │
                    │ Cache/Queues │
                    │  (Port 6379) │
                    └──────────────┘
```

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15 with 500 questions
- **Cache**: Redis 7 for leaderboards and caching
- **AI**: Google Gemini API (optional)
- **Infrastructure**: Docker & Docker Compose

---

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/quiz/next` | Get next question based on user difficulty |
| `POST` | `/v1/quiz/answer` | Submit answer and get feedback |
| `GET` | `/v1/quiz/metrics` | Get user statistics and performance data |
| `GET` | `/v1/leaderboard` | Get top 10 users by score and streak |
| `GET` | `/health` | Health check for backend service |

**Example Request:**
```bash
# Get next question
curl -H "x-user-id: user123" http://localhost:3002/v1/quiz/next

# Submit answer
curl -X POST http://localhost:3002/v1/quiz/answer \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -d '{
    "questionId": "q1",
    "answer": "Paris",
    "answerIdempotencyKey": "unique-key-123"
  }'
```

**Full API Documentation**: See [LLD.md](./LLD.md)

---

## 🛠️ Configuration

### Backend Environment Variables
Create `packages/backend/.env`:

```env
# Database
DATABASE_URL=postgresql://brainbolt:brainboltpassword@localhost:5432/brainbolt

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3002

# Optional: Gemini API for infinite questions
# Get free API key: https://makersuite.google.com/app/apikey
# GEMINI_API_KEY=your_api_key_here
```

### Frontend Environment Variables
Create `packages/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

**Note**: The app works perfectly with 500 database questions. Gemini API is optional for infinite questions.

---

## 📖 Documentation

- **[LLD.md](./LLD.md)** - Low-Level Design with architecture and algorithms
- **[EDGE_CASES.md](./EDGE_CASES.md)** - 40+ edge cases and handling strategies
- **[GEMINI_INTEGRATION.md](./GEMINI_INTEGRATION.md)** - AI integration setup guide
- **[QUESTION_BANK.md](./QUESTION_BANK.md)** - Question database details

---

## 🎯 Key Implementation Details

### Adaptive Difficulty Algorithm
Located in `packages/backend/src/algorithms/adaptive.ts`:
- Momentum-based difficulty adjustment
- Streak calculation with cap at 5 for scoring
- Difficulty range: 1-20

### Question Pool Management
- Redis SETs for O(1) random selection
- Excludes already-answered questions
- Smart fallback to closest available difficulty

### Idempotency
- Prevents duplicate submissions using unique keys
- Cached responses for repeated requests
- Transaction-safe answer processing

### Streak Decay
- Automatic decay after 24 hours of inactivity
- Configurable decay rate and threshold
- Preserves user engagement

---

## 🐳 Docker Services

The `docker-compose.yml` orchestrates 4 services:

1. **Backend**: Express API with Prisma
2. **Frontend**: Next.js application
3. **PostgreSQL**: Database with 500 questions
4. **Redis**: Caching and leaderboards

**Commands:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

---

## 🎨 UI Features

- **Gradient Design**: Modern purple-to-pink gradients
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Animations**: Smooth transitions and micro-interactions
- **Toast Notifications**: Non-blocking feedback for answers
- **Responsive Layout**: Mobile-first design
- **High Contrast**: Accessible color combinations

---

## 🔧 Development Commands

```bash
# Backend
cd packages/backend
npm run dev          # Start dev server
npm test             # Run tests
npx prisma studio    # Open database GUI
npx prisma db seed   # Seed questions

# Frontend
cd packages/frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
```

---

## 📊 Database Schema

**Main Tables:**
- `user_state`: User progress, difficulty, streak, score
- `questions`: 500 questions with difficulty levels
- `answer_log`: Answer history for analytics
- `answer_idempotency`: Prevents duplicate submissions

**See [LLD.md](./LLD.md) for complete schema.**

---

## 🚀 Deployment

### Production Checklist
- [ ] Set production `DATABASE_URL`
- [ ] Configure CORS in backend
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure Redis persistence
- [ ] Add monitoring (optional)

---

## 📝 Project Structure

```
BrainBolt/
├── packages/
│   ├── backend/              # Express + Prisma backend
│   │   ├── src/
│   │   │   ├── algorithms/   # Adaptive difficulty logic
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── services/     # Business logic
│   │   │   └── lib/          # Redis, utilities
│   │   ├── prisma/           # Database schema & seed
│   │   └── Dockerfile
│   └── frontend/             # Next.js frontend
│       ├── src/
│       │   ├── app/          # Pages (quiz, leaderboard)
│       │   ├── components/   # React components
│       │   ├── lib/          # API client, types
│       │   └── styles/       # Design tokens
│       └── Dockerfile
├── infra/
│   └── seed/
│       └── questions.json    # 500 questions database
├── docker-compose.yml        # Multi-service orchestration
├── README.md                 # This file
├── LLD.md                    # Technical documentation
└── [demo.mp4]                # Demo video (to be added)
```

---

## ✅ Assignment Requirements

- ✅ **Single-Command Startup**: `docker-compose up -d`
- ✅ **Public GitHub Repository**: Ready for submission
- ⏳ **Demo Video**: To be added to root folder

---

## 🏆 Features Summary

| Category | Features |
|----------|----------|
| **Backend** | 5 REST APIs, Adaptive algorithm, Rate limiting, Idempotency, Caching |
| **Frontend** | Modern UI, Real-time updates, Toast notifications, Responsive design |
| **Database** | 500 questions, 20 difficulty levels, Optimized indexes |
| **Infrastructure** | Docker setup, Health checks, Redis integration |
| **AI Integration** | Gemini API with automatic fallback |
| **Documentation** | LLD, Edge cases, API docs, Setup guides |

---

**Built with ❤️ for adaptive learning | Ready for evaluation** 🚀
