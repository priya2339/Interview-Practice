const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Session = require('../models/Session');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MAX_QUESTIONS = 25;

const usedQuestions = {
  javascript: new Set(),
  python: new Set(),
  html: new Set(),
  css: new Set(),
  sql: new Set(),
};

const usedTopics = {
  javascript: new Set(),
  python: new Set(),
  html: new Set(),
  css: new Set(),
  sql: new Set(),
};

const topicsMap = {
  javascript: ["variables", "data types", "functions", "scope", "operators", "arrays", "objects", "DOM", "events", "async/await", "promises", "error handling"],
  python: ["variables", "data types", "functions", "loops", "lists", "dictionaries", "OOP", "exceptions", "generators", "decorators"],
  html: ["elements", "attributes", "forms", "semantic tags", "accessibility", "HTML5 features"],
  css: ["selectors", "box model", "flexbox", "grid", "responsive design", "animations", "specificity", "media queries"],
  sql: ["queries", "joins", "indexing", "normalization", "transactions", "aggregate functions", "subqueries"]
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function generateContentWithRetry(model, prompt, retries = 3, delay = 25000) {
  try {
    return await model.generateContent(prompt);
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      console.log(`Rate limited. Retrying in ${delay / 1000} seconds...`);
      await new Promise(res => setTimeout(res, delay));
      return generateContentWithRetry(model, prompt, retries - 1, delay);
    }
    throw error;
  }
}

router.post('/ask', async (req, res) => {
  const { language, index } = req.body;
  if (!language || typeof index !== 'number') {
    return res.status(400).json({ error: 'Language and question index are required.' });
  }

  const lang = language.toLowerCase();
  if (!topicsMap[lang]) {
    return res.status(400).json({ error: 'Invalid language provided.' });
  }

  if (index >= MAX_QUESTIONS) {
    return res.json({ done: true });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const unusedTopics = topicsMap[lang].filter(t => !usedTopics[lang].has(t));
    if (unusedTopics.length === 0) {
      return res.status(500).json({ error: "All topics used for this language." });
    }

    const selectedTopic = unusedTopics[getRandomInt(unusedTopics.length)];
    const prompt = `You are a senior interviewer for ${lang.toUpperCase()}.
Generate a unique ${lang.toUpperCase()} interview question for beginners. Avoid coding-based questions.
Focus on this topic: ${selectedTopic}.
Return only the question text.`;

    let question;
    for (let tries = 0; tries < 5; tries++) {
      const result = await generateContentWithRetry(model, prompt);
      const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text && !usedQuestions[lang].has(text)) {
        usedQuestions[lang].add(text);
        usedTopics[lang].add(selectedTopic);
        question = text;
        break;
      }
    }

    if (!question) {
      return res.status(500).json({ error: "Could not generate a unique question." });
    }

    return res.json({ question });
  } catch (error) {
    console.error('Error generating question:', error);
    return res.status(500).json({ error: 'Failed to generate question.' });
  }
});

router.post('/answer', async (req, res) => {
  const { question, userAnswer, language } = req.body;
  if (!question || !userAnswer || !language) {
    return res.status(400).json({ error: 'Question, answer, and language are required.' });
  }

  const lang = language.toLowerCase();
  if (!topicsMap[lang]) {
    return res.status(400).json({ error: 'Invalid language provided.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a senior technical interviewer for ${lang.toUpperCase()}.
Question: ${question}
Student's Answer: ${userAnswer}

Evaluate the answer. Return feedback in this format:

1. **Clarity (score out of 10)**
2. **Correctness (score out of 10)**
3. **Suggestions for Improvement**
4. **Learning Advice**
5. **Final Verdict** (Acceptable / Needs Improvement / Incorrect)`;

    const result = await generateContentWithRetry(model, prompt);
    const feedback = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!feedback) {
      return res.status(500).json({ error: 'No feedback generated.' });
    }

    const session = new Session({ language: lang, question, userAnswer, feedback });
    await session.save();

    return res.json({ feedback });
  } catch (error) {
    console.error('Error analyzing answer:', error);
    return res.status(500).json({ error: 'Failed to analyze answer.' });
  }
});

module.exports = router;
