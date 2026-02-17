export interface GeneratedQuestion {
    prompt: string;
    choices: string[];
    correct: string;
    difficulty: number;
}

class GeminiQuestionGenerator {
    private apiKey: string | null = null;
    private enabled: boolean = false;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey.trim() !== '') {
            this.apiKey = apiKey;
            this.enabled = true;
            console.log('✅ Gemini API key loaded - infinite questions enabled');
        } else {
            console.log('ℹ️  No Gemini API key found, using database questions only');
            this.enabled = false;
        }
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    async generateQuestion(difficulty: number): Promise<GeneratedQuestion | null> {
        if (!this.enabled || !this.apiKey) {
            return null;
        }

        try {
            const prompt = this.buildPrompt(difficulty);

            // Use REST API directly instead of SDK to avoid auth issues
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No text in response');
            }

            console.log('✅ Gemini generated question successfully');
            return this.parseResponse(text, difficulty);

        } catch (error: any) {
            console.error('Gemini API error, falling back to database:', error.message);
            return null;
        }
    }

    private buildPrompt(difficulty: number): string {
        // Simple difficulty-based math topics
        let mathTopic = '';
        if (difficulty <= 4) {
            mathTopic = 'simple addition, subtraction, or basic multiplication (single digit numbers)';
        } else if (difficulty <= 8) {
            mathTopic = 'multiplication tables, division, or basic fractions';
        } else if (difficulty <= 12) {
            mathTopic = 'percentages, decimals, or simple algebra';
        } else if (difficulty <= 16) {
            mathTopic = 'algebra, geometry, or basic calculus';
        } else {
            mathTopic = 'advanced algebra, calculus, or statistics';
        }

        return `Generate a MATH question ONLY. Difficulty level: ${difficulty}/20

TOPIC: ${mathTopic}

CRITICAL RULES:
1. ONLY MATH - arithmetic, algebra, geometry, calculus, percentages, fractions
2. NO history, science, programming, geography, or general knowledge
3. Write ONE simple question - no labels, no "Question #X", no "Level X"
4. Question must end with "?"
5. Provide exactly 4 SHORT answer choices (numbers or short phrases)
6. All choices must be REAL math answers - NO "Wrong A", "Wrong B", "Answer 1-2"

GOOD EXAMPLES:
"What is 15 + 27?" → ["42", "32", "52", "41"]
"What is 20% of 50?" → ["10", "5", "15", "20"]
"What is the square root of 64?" → ["8", "6", "7", "9"]

BAD - DO NOT CREATE:
"History Question Level 1 #9: What is the Level 1 term?"
"Science Question Level 4 #4: What is the Level 4 term?"

OUTPUT (JSON only):
{
  "prompt": "What is 5 + 3?",
  "choices": ["8", "7", "9", "6"],
  "correct": "8"
}

Generate a math question now (JSON only):`;
    }

    private parseResponse(text: string, difficulty: number): GeneratedQuestion | null {
        try {
            // Extract JSON from response (handle markdown code blocks)
            let jsonText = text.trim();

            // Remove markdown code blocks if present
            if (jsonText.includes('```json')) {
                jsonText = jsonText.split('```json')[1].split('```')[0].trim();
            } else if (jsonText.includes('```')) {
                jsonText = jsonText.split('```')[1].split('```')[0].trim();
            }

            const parsed = JSON.parse(jsonText);

            // Validate structure
            if (!parsed.prompt || !Array.isArray(parsed.choices) || !parsed.correct) {
                throw new Error('Invalid question structure');
            }

            if (parsed.choices.length !== 4) {
                throw new Error('Must have exactly 4 choices');
            }

            if (!parsed.choices.includes(parsed.correct)) {
                throw new Error('Correct answer must be one of the choices');
            }

            // ===== QUALITY VALIDATION: Reject bad questions =====
            const prompt = parsed.prompt.toLowerCase();
            const choicesText = parsed.choices.join(' ').toLowerCase();

            // Reject meta-questions about the quiz itself
            const badPatterns = [
                'level', 'question #', 'term?', 'difficulty',
                'wrong a', 'wrong b', 'wrong c', 'wrong d',
                'answer 1', 'answer 2', 'answer 3', 'answer 4',
                'choice a', 'choice b', 'choice c', 'choice d',
                '#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9',
                'what is the level', 'question level',
                'history question', // NEW: Reject history meta-text
                'level 1 term', 'level 2 term', 'level 3 term', // NEW: Reject level term questions
                'geography question', 'science question', // NEW: Reject other subject meta-text
            ];

            for (const pattern of badPatterns) {
                if (prompt.includes(pattern) || choicesText.includes(pattern)) {
                    console.warn(`⚠️  Rejected bad Gemini question containing "${pattern}": ${parsed.prompt}`);
                    throw new Error(`Question contains prohibited pattern: ${pattern}`);
                }
            }

            // Reject if choices contain sequential numbers (test data pattern)
            const hasTestPattern = parsed.choices.some((choice: string) =>
                /answer \d+-\d+/i.test(choice) ||
                /wrong [a-d]/i.test(choice) ||
                /choice [a-d]/i.test(choice)
            );

            if (hasTestPattern) {
                console.warn(`⚠️  Rejected Gemini question with test data pattern: ${JSON.stringify(parsed.choices)}`);
                throw new Error('Question contains test data patterns');
            }

            // Validate question is actually asking something
            if (!parsed.prompt.includes('?')) {
                console.warn(`⚠️  Rejected Gemini question without question mark: ${parsed.prompt}`);
                throw new Error('Question must end with a question mark');
            }

            console.log(`✅ Validated good Gemini question: ${parsed.prompt.substring(0, 50)}...`);

            return {
                prompt: parsed.prompt,
                choices: parsed.choices,
                correct: parsed.correct,
                difficulty
            };
        } catch (error) {
            console.error('Failed to parse/validate Gemini response:', error);
            return null;
        }
    }
}

// Singleton instance
export const geminiGenerator = new GeminiQuestionGenerator();
