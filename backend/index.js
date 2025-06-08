const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const interviewRoutes = require('./routes/interview');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.use(cors());
app.use(express.json());

app.use('/api', interviewRoutes);


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});


app.get("/", (req, res) => {
  res.status(200).send('Hello from the server.')
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
