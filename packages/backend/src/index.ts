import { httpServer } from './app';
import { initializeAllQuestionPools } from './services/questionPool';

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    // Initialize question pools in Redis
    try {
        await initializeAllQuestionPools();
    } catch (err) {
        console.error('Failed to initialize question pools:', err);
    }
});
