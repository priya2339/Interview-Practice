let currentQuestionIndex = 0;
let selectedLanguage = 'javascript';

const languageSelect = document.getElementById('languageSelect');
const questionEl = document.getElementById('question');
const answerSection = document.getElementById('answerSection');
const feedbackSection = document.getElementById('feedbackSection');
const nextQuestionBtn = document.getElementById('nextQuestion');
const answerInput = document.getElementById('answerInput');

languageSelect.addEventListener('change', () => {
  selectedLanguage = languageSelect.value;
  resetInterview();
});

document.getElementById('startInterview').addEventListener('click', async () => {
  resetInterview();
  await fetchAndDisplayQuestion();
});

document.getElementById('submitAnswer').addEventListener('click', async () => {
  const question = questionEl.innerText;
  const userAnswer = answerInput.value.trim();

  if (!userAnswer) {
    alert("Please enter an answer before submitting.");
    return;
  }

  const response = await fetch('https://interview-practice-flame.vercel.app/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userAnswer, language: selectedLanguage }),
  });

  const data = await response.json();

  feedbackSection.innerText = data.feedback;
  feedbackSection.style.display = 'block';
  speakText(data.feedback);

  currentQuestionIndex++;
  nextQuestionBtn.style.display = 'inline-block';
  answerSection.style.display = 'none';
});

nextQuestionBtn.addEventListener('click', async () => {
  await fetchAndDisplayQuestion();
  feedbackSection.style.display = 'none';
  answerInput.value = '';
  nextQuestionBtn.style.display = 'none';
  answerSection.style.display = 'block';
});

async function fetchAndDisplayQuestion() {
  const response = await fetch('https://interview-practice-flame.vercel.app/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: selectedLanguage, index: currentQuestionIndex }),
  });

  const data = await response.json();

  if (data.done) {
    questionEl.innerText = "🎉 Interview Complete!";
    answerSection.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    return;
  }

  questionEl.innerText = data.question;
  speakText(data.question);
}

document.getElementById('speakAnswer').addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    answerInput.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };
});

function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }
}

function resetInterview() {
  currentQuestionIndex = 0;
  questionEl.innerText = '';
  answerInput.value = '';
  feedbackSection.innerText = '';
  feedbackSection.style.display = 'none';
  answerSection.style.display = 'block';
  nextQuestionBtn.style.display = 'none';
}






























