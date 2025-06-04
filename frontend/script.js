// document.getElementById('startInterview').addEventListener('click', async () => {
//   const response = await fetch('http://localhost:3000/api/interview/ask', {
//     method: 'POST',
//   });
//   const data = await response.json();
//   document.getElementById('question').innerText = data.question;
//   document.getElementById('answerSection').style.display = 'block';
//   speakText(data.question);
// });

// document.getElementById('submitAnswer').addEventListener('click', async () => {
//   const question = document.getElementById('question').innerText;
//   const userAnswer = document.getElementById('answerInput').value;

//   const response = await fetch('http://localhost:3000/api/interview/answer', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ question, userAnswer })
//   });

//   const data = await response.json();
//   document.getElementById('feedback').innerText = data.feedback;
//   document.getElementById('feedbackSection').style.display = 'block';
//   speakText(data.feedback);
// });

// document.getElementById('speakAnswer').addEventListener('click', () => {
//   const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//   recognition.lang = 'en-US';
//   recognition.start();

//   recognition.onresult = (event) => {
//     const transcript = event.results[0][0].transcript;
//     document.getElementById('answerInput').value = transcript;
//   };

//   recognition.onerror = (event) => {
//     console.error('Speech recognition error:', event.error);
//   };
// });

// function speakText(text) {
//   const utterance = new SpeechSynthesisUtterance(text);
//   utterance.lang = 'en-US';
//   speechSynthesis.speak(utterance);
// }









// let currentQuestionIndex = 0;

// // START INTERVIEW
// document.getElementById('startInterview').addEventListener('click', async () => {
//   await fetchAndDisplayQuestion();
// });

// // SUBMIT ANSWER
// document.getElementById('submitAnswer').addEventListener('click', async () => {
//   const question = document.getElementById('question').innerText;
//   const userAnswer = document.getElementById('answerInput').value;

//   if (!userAnswer.trim()) {
//     alert("Please enter an answer before submitting.");
//     return;
//   }

//   const response = await fetch('http://localhost:3000/api/interview/answer', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ question, userAnswer })
//   });

//   const data = await response.json();
//   document.getElementById('feedback').innerText = data.feedback;
//   document.getElementById('feedbackSection').style.display = 'block';

//   speakText(data.feedback);

//   // Prepare for next question
//   currentQuestionIndex++;
//   document.getElementById('nextQuestion').style.display = 'block';
// });

// // NEXT QUESTION
// document.getElementById('nextQuestion').addEventListener('click', async () => {
//   await fetchAndDisplayQuestion();
//   document.getElementById('feedbackSection').style.display = 'none';
//   document.getElementById('answerInput').value = '';
//   document.getElementById('nextQuestion').style.display = 'none';
// });

// // FETCH QUESTION FUNCTION
// async function fetchAndDisplayQuestion() {
//   const response = await fetch('http://localhost:3000/api/interview/ask', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ index: currentQuestionIndex })
//   });

//   const data = await response.json();

//   if (data.done) {
//     document.getElementById('question').innerText = "🎉 Interview Complete!";
//     document.getElementById('answerSection').style.display = 'none';
//     document.getElementById('nextQuestion').style.display = 'none';
//     return;
//   }

//   document.getElementById('question').innerText = data.question;
//   document.getElementById('answerSection').style.display = 'block';
//   speakText(data.question);
// }

// // SPEECH RECOGNITION
// document.getElementById('speakAnswer').addEventListener('click', () => {
//   const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//   recognition.lang = 'en-US';
//   recognition.start();

//   recognition.onresult = (event) => {
//     const transcript = event.results[0][0].transcript;
//     document.getElementById('answerInput').value = transcript;
//   };

//   recognition.onerror = (event) => {
//     console.error('Speech recognition error:', event.error);
//   };
// });

// // SPEAK TEXT
// function speakText(text) {
//   const utterance = new SpeechSynthesisUtterance(text);
//   utterance.lang = 'en-US';
//   speechSynthesis.speak(utterance);
// }



















// let currentQuestionIndex = 0;
// let selectedLanguage = 'javascript';

// const languageSelect = document.getElementById('languageSelect');
// const questionEl = document.getElementById('question');
// const answerSection = document.getElementById('answerSection');
// const feedbackSection = document.getElementById('feedbackSection');
// const nextQuestionBtn = document.getElementById('nextQuestion');
// const answerInput = document.getElementById('answerInput');

// languageSelect.addEventListener('change', () => {
//   selectedLanguage = languageSelect.value;
//   resetInterview();
// });

// document.getElementById('startInterview').addEventListener('click', async () => {
//   resetInterview();
//   await fetchAndDisplayQuestion();
// });

// document.getElementById('submitAnswer').addEventListener('click', async () => {
//   const question = questionEl.innerText;
//   const userAnswer = answerInput.value.trim();

//   if (!userAnswer) {
//     alert("Please enter an answer before submitting.");
//     return;
//   }

//   const response = await fetch('http://localhost:3000/api/interview/answer', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ question, userAnswer, language: selectedLanguage }),
//   });

//   const data = await response.json();

//   feedbackSection.innerText = data.feedback;
//   feedbackSection.style.display = 'block';

//   speakText(data.feedback);

//   currentQuestionIndex++;
//   nextQuestionBtn.style.display = 'inline-block';
//   answerSection.style.display = 'none';
// });

// nextQuestionBtn.addEventListener('click', async () => {
//   await fetchAndDisplayQuestion();
//   feedbackSection.style.display = 'none';
//   answerInput.value = '';
//   nextQuestionBtn.style.display = 'none';
//   answerSection.style.display = 'block';
// });

// async function fetchAndDisplayQuestion() {
//   const response = await fetch('http://localhost:3000/api/interview/ask', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ language: selectedLanguage, index: currentQuestionIndex }),
//   });

//   const data = await response.json();

//   if (data.done) {
//     questionEl.innerText = "🎉 Interview Complete!";
//     answerSection.style.display = 'none';
//     nextQuestionBtn.style.display = 'none';
//     return;
//   }

//   questionEl.innerText = data.question;
//   speakText(data.question);
// }

// // Speech recognition for answer input
// document.getElementById('speakAnswer').addEventListener('click', () => {
//   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//   if (!SpeechRecognition) {
//     alert("Speech recognition is not supported in this browser.");
//     return;
//   }

//   const recognition = new SpeechRecognition();
//   recognition.lang = 'en-US';
//   recognition.start();

//   recognition.onresult = (event) => {
//     const transcript = event.results[0][0].transcript;
//     answerInput.value = transcript;
//   };

//   recognition.onerror = (event) => {
//     console.error('Speech recognition error:', event.error);
//   };
// });

// // Function to speak text aloud
// function speakText(text) {
//   if ('speechSynthesis' in window) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = 'en-US';
//     speechSynthesis.speak(utterance);
//   }
// }

// function resetInterview() {
//   currentQuestionIndex = 0;
//   questionEl.innerText = '';
//   answerInput.value = '';
//   feedbackSection.innerText = '';
//   feedbackSection.style.display = 'none';
//   answerSection.style.display = 'block';
//   nextQuestionBtn.style.display = 'none';
// }
















let currentQuestionIndex = 0;
let selectedLanguage = 'javascript';

const languageSelect = document.getElementById('languageSelect');
const questionEl = document.getElementById('question');
const answerSection = document.getElementById('answerSection');
const feedbackSection = document.getElementById('feedbackSection');
const nextQuestionBtn = document.getElementById('nextQuestion');
const answerInput = document.getElementById('answerInput');

// Update selected language
languageSelect.addEventListener('change', () => {
  selectedLanguage = languageSelect.value;
  resetInterview();
});

// Start interview
document.getElementById('startInterview').addEventListener('click', async () => {
  resetInterview();
  await fetchAndDisplayQuestion();
});

// Submit answer
document.getElementById('submitAnswer').addEventListener('click', async () => {
  const question = questionEl.innerText;
  const userAnswer = answerInput.value.trim();

  if (!userAnswer) {
    alert("Please enter an answer before submitting.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/interview/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, userAnswer, language: selectedLanguage }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Server error');
    }

    const data = await response.json();

    feedbackSection.innerText = data.feedback;
    feedbackSection.style.display = 'block';
    speakText(data.feedback);

    currentQuestionIndex++;
    nextQuestionBtn.style.display = 'inline-block';
    answerSection.style.display = 'none';

  } catch (error) {
    console.error('Error submitting answer:', error);
    alert('Failed to submit answer. Please try again.');
  }
});

// Load next question
nextQuestionBtn.addEventListener('click', async () => {
  await fetchAndDisplayQuestion();
  feedbackSection.style.display = 'none';
  answerInput.value = '';
  nextQuestionBtn.style.display = 'none';
  answerSection.style.display = 'block';
});

// Fetch a new question
async function fetchAndDisplayQuestion() {
  try {
    const response = await fetch('http://localhost:3000/api/interview/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: selectedLanguage, index: currentQuestionIndex }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Server error');
    }

    const data = await response.json();

    if (data.done) {
      questionEl.innerText = "🎉 Interview Complete!";
      answerSection.style.display = 'none';
      nextQuestionBtn.style.display = 'none';
      return;
    }

    questionEl.innerText = data.question;
    speakText(data.question);

  } catch (error) {
    console.error('Error fetching question:', error);
    alert('Failed to load a question. Please try again.');
  }
}

// Speech recognition for answer input
document.getElementById('speakAnswer').addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onstart = () => {
    answerInput.placeholder = "Listening...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    answerInput.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    alert('Speech recognition failed. Please try again.');
  };

  recognition.onend = () => {
    answerInput.placeholder = "Type or speak your answer...";
  };

  recognition.start();
});

// Speak text aloud
function speakText(text) {
  if ('speechSynthesis' in window && text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.cancel(); // Cancel any ongoing speech
    speechSynthesis.speak(utterance);
  }
}

// Reset UI for new interview
function resetInterview() {
  currentQuestionIndex = 0;
  questionEl.innerText = '';
  answerInput.value = '';
  feedbackSection.innerText = '';
  feedbackSection.style.display = 'none';
  answerSection.style.display = 'block';
  nextQuestionBtn.style.display = 'none';
}


