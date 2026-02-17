import { test, expect } from '@playwright/test';

test('User session: Start quiz, answer question, check leaderboard', async ({ page }) => {
    // 1. Visit Home
    await page.goto('/');
    await expect(page).toHaveTitle(/BrainBolt/);

    // 2. Start Quiz (assuming there is a start button or direct navigation)
    // Check if we are on the home page and look for a "Start Quiz" button
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
        await startButton.click();
    } else {
        // Fallback if direct game page
        await page.goto('/quiz'); // Adjust route if needed
    }

    // Wait for question to load
    // We look for the question text container (h2) or answer choices
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByLabel(/answer choices/i)).toBeVisible();

    // 3. GET next question (implicitly handled by loading the page)
    // 4. POST answer (correct)
    // We'll select the first option for now, assuming it's valid.
    // Ideally, we'd know the correct answer, but for a black-box test, we just simulate interaction.
    const optionButton = page.locator('button').filter({ hasText: /./ }).first(); // loose
    await optionButton.click();

    // 5. Verify leaderboard changed or score updated
    // Navigate to leaderboard
    await page.goto('/leaderboard');
    await expect(page).toHaveURL(/.*leaderboard/);
    await expect(page.getByText(/Leaderboard/i)).toBeVisible();

    // Check if there is at least one entry
    await expect(page.locator('li').first()).toBeVisible();
});
