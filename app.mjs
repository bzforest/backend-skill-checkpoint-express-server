import express from "express";
import connectionPool from "./utils/db.mjs";
import questionRouter from "./routes/question.mjs";
import answerRouter from "./routes/answer.mjs";

const app = express();
const port = 4000;

app.use(express.json());
app.use("/questions" , questionRouter)
app.use("/answers" , answerRouter)

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/test-db" , async (req,res) => {
  try {
    const results = await connectionPool.query(`SELECT * FROM answers`)
    return res.status(200).json ({
      data : results.rows
    })

  }catch (error) {
    res.status(500).json({
      message : "database don't working"
    })
    console.log(error)
  }
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
