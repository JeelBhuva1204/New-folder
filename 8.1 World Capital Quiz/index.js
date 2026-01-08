import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { name, render } from "ejs";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "stud",
  port: 5432,
});
db.connect();
let quiz = [];
db.query("SELECT * FROM capitals;", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }
 
}); 

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
    nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
}else{
  
  res.render("submit.ejs",{
    totalScore: totalCorrect,})
}
});
 
app.post("/review",(req,res) => {
  console.log(req.body.name)
  db.query(`insert into public."User_data" ("name","email","feedback","phone_number") values ('${req.body.name}','${req.body.email}','${req.body.feedback}',${req.body.phone_number})`,(err,responce) => {
    if(err){
      console.error("not send feedback!",err.stack)
    }else{
      res.render("index.ejs",{ question: currentQuestion })
      db.end()
    }
  })
}) 
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
