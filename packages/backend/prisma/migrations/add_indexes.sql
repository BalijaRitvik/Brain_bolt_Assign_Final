-- Add indexes for better query performance
-- These should be run on the PostgreSQL database

-- Questions table indexes
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);

-- User state indexes  
CREATE INDEX IF NOT EXISTS idx_user_state_userId ON user_state(userId);
CREATE INDEX IF NOT EXISTS idx_user_state_lastAnswerAt ON user_state(lastAnswerAt);
CREATE INDEX IF NOT EXISTS idx_user_state_totalScore ON user_state(totalScore DESC);
CREATE INDEX IF NOT EXISTS idx_user_state_maxStreak ON user_state(maxStreak DESC);

-- Answer log indexes
CREATE INDEX IF NOT EXISTS idx_answer_log_userId ON answer_log(userId);
CREATE INDEX IF NOT EXISTS idx_answer_log_userId_answeredAt ON answer_log(userId, answeredAt DESC);
CREATE INDEX IF NOT EXISTS idx_answer_log_questionId ON answer_log(questionId);
CREATE INDEX IF NOT EXISTS idx_answer_log_answeredAt ON answer_log(answeredAt DESC);

-- Answer idempotency indexes
CREATE INDEX IF NOT EXISTS idx_answer_idempotency_userId ON answer_idempotency(userId);
CREATE INDEX IF NOT EXISTS idx_answer_idempotency_createdAt ON answer_idempotency(createdAt DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_answer_log_userId_isCorrect ON answer_log(userId, isCorrect);
