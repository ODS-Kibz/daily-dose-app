import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Set view engine & middleware
app.set("view engine", "ejs");
app.use(express.static("public")); // Serve static files from the public directory
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Home Route
app.get("/", (req, res) => {
  res.render("layout", {title:"Home", content: "home"}); // Note the change here
});

// Advice route
app.get('/advice', async (req, res) => {
  try {
    const response = await axios.get('https://api.adviceslip.com/advice');
    const advice = response.data.slip.advice;

    // Directly render the advice.ejs file and pass the data to it
    res.render('advice', {
      title: 'Advice',
      advice: advice
    });

  } catch (err) {
    res.status(500).send('Error fetching advice');
  }
});

// NASA image route
app.get('/nasa-image', async (req, res) => {
  try {
    // Fetch NASA's Astronomy Picture of the Day (APOD)
    const response = await axios.get('https://api.nasa.gov/planetary/apod', {
      params: {
        api_key: process.env.NASA_API_KEY, // Ensure you have the API key in .env
      }
    });

    const { url, title, explanation } = response.data;

    // Render the NASA image and data on a new EJS page
    res.render('nasa-image', {
      imageUrl: url,
      title: title,
      explanation: explanation
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching NASA image');
  }
});


// Trivia route
app.get('/trivia', async (req, res) => {
  try {
    // Fetch trivia data from Open Trivia Database API
    const response = await axios.get('https://opentdb.com/api.php', {
      params: {
        amount: 1, // Get one trivia question
        type: 'multiple', // Multiple choice question
      },
    });

    // Get the question, correct answer, and possible answers
    const question = response.data.results[0].question;
    const correctAnswer = response.data.results[0].correct_answer;
    const incorrectAnswers = response.data.results[0].incorrect_answers;

    // Combine the correct and incorrect answers
    const answers = [correctAnswer, ...incorrectAnswers];
    
    // Shuffle the answers
    answers.sort(() => Math.random() - 0.5);

    // Render the trivia page with the question and answers
    res.render('trivia', {
      question: question,
      answers: answers,
      correctAnswer: correctAnswer,  // Pass the correct answer to the page
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching trivia');
  }
});

// Route for handling the form submission (answer check)
app.post('/check-answer', (req, res) => {
  const { selectedAnswer, correctAnswer, question } = req.body;

  const resultMessage = selectedAnswer === correctAnswer
    ? "🎉 Correct!"
    : `❌ Incorrect! The correct answer was: ${correctAnswer}`;

  // Render the result page with the message
  res.render('trivia-result', {
    resultMessage: resultMessage,
    question: question,
    selectedAnswer: selectedAnswer,
    correctAnswer: correctAnswer  // Ensure correctAnswer is passed here
  });
});




// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
