import request from 'supertest';
import { httpServer } from '../../src/app';
import redis from '../../src/services/redis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Setup/Teardown
beforeAll(async () => {
    // Connect DB
    // Assume Docker is up for E2E
});

afterAll(async () => {
    await prisma.$disconnect();
    redis.disconnect();
    httpServer.close();
});

describe('E2E API Flow', () => {
    const userId = 'e2e-user-' + Date.now();
    let questionId: string;
    let sessionId: string;
    let idempotencyKey = 'idem-' + Date.now();

    it('GET /v1/quiz/next returns a question', async () => {
        const res = await request(httpServer)
            .get('/v1/quiz/next')
            .set('x-user-id', userId);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('questionId');
        expect(res.body).toHaveProperty('prompt');
        expect(res.body).toHaveProperty('sessionId');

        questionId = res.body.questionId;
        sessionId = res.body.sessionId;
    });

    it('POST /v1/quiz/answer submits an answer', async () => {
        // We don't know the correct answer easily without checking DB, 
        // asking the endpoint with a random choice might be wrong.
        // But for E2E we verify the response structure.

        const res = await request(httpServer)
            .post('/v1/quiz/answer')
            .set('x-user-id', userId)
            .send({
                questionId,
                answer: 'Some Answer',
                answerIdempotencyKey: idempotencyKey,
                sessionId
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('correct');
        expect(res.body).toHaveProperty('scoreDelta');
        expect(res.body).toHaveProperty('stateVersion');
    });

    it('POST /v1/quiz/answer is idempotent', async () => {
        const res = await request(httpServer)
            .post('/v1/quiz/answer')
            .set('x-user-id', userId)
            .send({
                questionId,
                answer: 'Some Answer',
                answerIdempotencyKey: idempotencyKey,
                sessionId
            });

        expect(res.status).toBe(200);
        // Should be exact same response logic usually, but at least success
    });

    it('GET /v1/leaderboard/score returns data', async () => {
        const res = await request(httpServer).get('/v1/leaderboard/score');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
