import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const questionsPath = path.resolve(__dirname, '../../../infra/seed/questions.json');
    console.log(`Loading questions from ${questionsPath}`);

    if (!fs.existsSync(questionsPath)) {
        console.warn("Questions seed file not found. Skipping.");
        return;
    }

    const data = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(data);

    for (const q of questions) {
        await prisma.questions.upsert({
            where: { id: q.id },
            update: {
                difficulty: q.difficulty,
                prompt: q.prompt,
                choices: q.choices,
                correct: q.correct
            },
            create: {
                id: q.id,
                difficulty: q.difficulty,
                prompt: q.prompt,
                choices: q.choices,
                correct: q.correct
            }
        });
    }
    console.log(`Seeded ${questions.length} questions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
