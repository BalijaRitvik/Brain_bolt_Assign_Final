import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// 1. Create the mock instance first
const prismaMock = mockDeep<PrismaClient>();

// 2. Mock the module to return a constructor that returns our mock instance
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => prismaMock)
}));

// 3. Mock Redis
jest.mock('../../src/services/redis', () => ({
    zadd: jest.fn(),
    on: jest.fn(),
    default: {
        zadd: jest.fn(),
        on: jest.fn(),
        zrevrange: jest.fn() // Added zrevrange just in case
    },
    LEADERBOARD_SCORE_KEY: 'leaderboard:score',
    LEADERBOARD_STREAK_KEY: 'leaderboard:streak'
}));

// 4. Import the service AFTER mocking
import { getNextQuestion, processAnswer } from '../../src/services/engine';

beforeEach(() => {
    jest.clearAllMocks();
    // No need to set mockImplementation here since the constructor mock returns the same object
});

describe('Quiz Engine', () => {
    test('getNextQuestion returns a question', async () => {
        const mockSession = {
            id: 's1', userId: 'u1', currentDifficulty: 1, currentScore: 0, currentStreak: 0, stateVersion: 1, createdAt: new Date(), updatedAt: new Date()
        };
        const mockQuestion = {
            id: 'q1', difficulty: 1, prompt: 'Q1', choices: [], correct: 'A', createdAt: new Date()
        };

        prismaMock.gameSession.findFirst.mockResolvedValue(mockSession);
        prismaMock.submission.findMany.mockResolvedValue([]);
        prismaMock.question.findMany.mockResolvedValue([mockQuestion]);

        const result = await getNextQuestion('u1');

        expect(result.question.id).toBe('q1');
        expect(result.session.id).toBe('s1');
    });

    test('processAnswer updates score on correct answer', async () => {
        const mockSession = {
            id: 's1', userId: 'u1', currentDifficulty: 1, currentScore: 0, currentStreak: 0, stateVersion: 1, createdAt: new Date(), updatedAt: new Date()
        };
        const mockQuestion = {
            id: 'q1', difficulty: 1, prompt: 'Q1', choices: [], correct: 'A', createdAt: new Date()
        };

        prismaMock.submission.findUnique.mockResolvedValue(null);
        prismaMock.question.findUnique.mockResolvedValue(mockQuestion);
        prismaMock.gameSession.findFirst.mockResolvedValue(mockSession);

        const mockUpdatedSession = { ...mockSession, currentScore: 10, currentStreak: 1, currentDifficulty: 2, stateVersion: 2 };
        const mockSubmission = { id: 'sub1' }; // partial

        prismaMock.$transaction.mockResolvedValue([mockSubmission, mockUpdatedSession]);

        const result = await processAnswer('u1', 'q1', 'A', 'idem1');

        expect(result.correct).toBe(true);
        expect(result.scoreDelta).toBe(10);
        expect(result.newDifficulty).toBe(2);
    });
});
