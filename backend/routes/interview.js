const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Session = require('../models/Session');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_QUESTIONS = 25;

// Track used questions and topics per language to avoid repeats
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

// Topics for each language
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

// Helper function to retry generateContent on 429 error with delay
async function generateContentWithRetry(model, prompt, retries = 3, delay = 25000) {
  try {
    return await model.generateContent(prompt);
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      console.log(`Rate limited by API. Retrying in ${delay / 1000} seconds... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return generateContentWithRetry(model, prompt, retries - 1, delay);
    }
    throw error;  // Re-throw if no retries left or other error
  }
}

// POST /api/interview/ask - Get a new interview question
router.post('/ask', async (req, res) => {
  const { language, index } = req.body;
  if (!language || typeof index !== 'number') {
    return res.status(400).json({ error: 'Language and question index are required.' });
  }

  const lang = language.toLowerCase();

  if (!Object.keys(topicsMap).includes(lang)) {
    return res.status(400).json({ error: 'Invalid language provided.' });
  }

  if (index >= MAX_QUESTIONS) {
    return res.json({ done: true });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Filter topics not used yet
    const allTopics = topicsMap[lang];
    const unusedTopics = allTopics.filter(t => !usedTopics[lang].has(t));

    if (unusedTopics.length === 0) {
      return res.status(500).json({ error: "All topics have been used for this language." });
    }

    const selectedTopic = unusedTopics[getRandomInt(unusedTopics.length)];

    const prompt = `
You are a senior interviewer for ${lang.toUpperCase()}.

Generate a unique ${lang.toUpperCase()} interview question for beginner students. Mostly, the question should NOT include coding.

Make sure it has NOT been asked before in this session.

This is question ${index + 1} out of ${MAX_QUESTIONS}.

Focus ONLY on this topic: ${selectedTopic}

Return only the question text. No explanation or numbering.
`;

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
      return res.status(500).json({ error: "Failed to generate a unique question." });
    }

    return res.json({ question });
  } catch (error) {
    console.error('Error generating question:', error);
    return res.status(500).json({ error: 'Failed to generate question.' });
  }
});

// POST /api/interview/answer - Submit answer and get feedback
router.post('/answer', async (req, res) => {
  const { question, userAnswer, language } = req.body;

  if (!question || !userAnswer || !language) {
    return res.status(400).json({ error: 'Question, answer, and language are required.' });
  }

  const lang = language.toLowerCase();

  if (!Object.keys(topicsMap).includes(lang)) {
    return res.status(400).json({ error: 'Invalid language provided.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    You are acting as a senior technical interviewer for ${lang.toUpperCase()}.
    
    You are evaluating a beginner student's response to an interview question. Analyze the answer thoroughly.
    
    Provide your feedback in the following format:
    
    1. **Clarity (score out of 10)**: How clear and well-expressed the answer is.
    2. **Correctness (score out of 10)**: Evaluate if the content is accurate and aligned with best practices in ${lang.toUpperCase()}.
    3. **Suggestions for Improvement**: Point out what was missing, unclear, or incorrect. Be specific and constructive.
    4. **Learning Advice**: Suggest the best way for the student to improve their understanding of this topic. You may recommend keywords to search, tutorials, exercises, or online platforms (e.g., MDN for JS, W3Schools, freeCodeCamp, GeeksforGeeks, etc.).
    5. **Final Verdict**: Choose one – Acceptable / Needs Improvement / Incorrect. Be concise.
    
    Do NOT include or repeat the question or answer itself. Only return the formatted feedback.
    `;
    

    console.log('Prompt:', prompt);
    const result = await generateContentWithRetry(model, prompt);
    console.log('Result:', result);

    const feedback = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!feedback) {
      return res.status(500).json({ error: 'No feedback generated.' });
    }

    // Save session data
    const session = new Session({ language: lang, question, userAnswer, feedback });
    await session.save();

    return res.json({ feedback });
  } catch (error) {
    console.error('Error analyzing answer:', error);
    return res.status(500).json({ error: 'Failed to analyze answer.' });
  }
});

module.exports = router;
