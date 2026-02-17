// Simpler Gemini test with correct API version
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testGeminiModels() {
    const apiKey = process.env.GEMINI_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);

    console.log('🧪 Testing Gemini models...\n');

    // Models to try (non-beta versions)
    const models = [
        'gemini-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-latest',
    ];

    for (const modelName of models) {
        try {
            console.log(`Testing: ${modelName}...`);
            const model = genAI.getGenerativeModel({
                model: modelName,
            });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: 'Say only the word SUCCESS if you can read this.' }] }],
            });

            const text = result.response.text();
            console.log(`✅ ${modelName} WORKS!`);
            console.log(`   Response: ${text}\n`);
            return modelName;

        } catch (error: any) {
            console.log(`❌ ${modelName} failed: ${error.message}\n`);
        }
    }

    console.log('❌ No working model found');
}

testGeminiModels();
