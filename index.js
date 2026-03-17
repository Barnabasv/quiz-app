import { select } from '@inquirer/prompts';
import { readFile, writeFile } from 'fs/promises';

const questionsPath = './questions.json';
const scoresPath = './scores.json';

async function loadQuestions() {
  const data = await readFile(questionsPath, 'utf-8');
  return JSON.parse(data);
}

async function selectCategory(categories) {
  const category = await select({
    message: 'Choose a category:',
    choices: categories.map(c => ({ name: c.name, value: c.name }))
  });
  return categories.find(c => c.name === category);
}

async function runQuiz(category) {
  let score = 0;

  console.log(`\nStarting ${category.name} quiz — ${category.questions.length} questions\n`);

  for (const q of category.questions) {
    const answer = await select({
      message: q.question,
      choices: q.choices.map(choice => ({ name: choice, value: choice }))
    });

    if (answer === q.answer) {
      console.log('  Correct!\n');
      score++;
    } else {
      console.log(`  Wrong — the answer was: ${q.answer}\n`);
    }
  }

  return score;
}

async function saveScore(category, score, total) {
  let scores = [];

  try {
    const data = await readFile(scoresPath, 'utf-8');
    if (data.trim()) scores = JSON.parse(data);
  } catch {
    scores = [];
  }

  scores.push({
    category: category.name,
    score: score,
    total: total,
    date: new Date().toLocaleDateString()
  });

  await writeFile(scoresPath, JSON.stringify(scores, null, 2));
  console.log(`\nScore saved! You got ${score} out of ${total}.`);
}

async function main() {
  console.log('\n=== Welcome to Quiz App ===\n');

  const data = await loadQuestions();
  const category = await selectCategory(data.categories);
  const score = await runQuiz(category);
  await saveScore(category, score, category.questions.length);
}

main();


