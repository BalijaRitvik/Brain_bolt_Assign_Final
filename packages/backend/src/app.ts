import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import quizRoutes from './routes/quiz';
import leaderboardRoutes from './routes/leaderboard';
import metricsRoutes from './routes/metrics';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Routes
app.use('/v1/quiz', quizRoutes);
app.use('/v1/leaderboard', leaderboardRoutes);
app.use('/v1/quiz/metrics', metricsRoutes);

// Socket.IO
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Join leaderboard room?
    socket.on('join-leaderboard', () => {
        socket.join('leaderboard');
    });
});

// Make io available in request or globally? 
// For now, export it or attach to app.
app.set('io', io);

export { httpServer, io };
