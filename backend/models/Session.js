const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  language: String, // Added language field
  question: String,
  userAnswer: String,
  feedback: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Session', sessionSchema);
