import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateVote } from "../middleware/validateForm.mjs";

const answerRouter = Router();

answerRouter.post("/:answerId/vote", [validateVote] ,async (req, res) => {

    const { answerId } = req.params
    const { vote } = req.body;
  
    try {
  
        const answerCheck = await connectionPool.query(`SELECT * FROM answers WHERE id = $1`, [answerId])
        if (!answerCheck.rows[0]) {
            return res.status(404).json({
                message: "Answer not found."
            })
        }
  
        await connectionPool.query(`INSERT INTO answer_votes(answer_id , vote) values($1 , $2)`, [answerId ,vote]);
        return res.status(200).json({
            message: "Vote on the answer has been recorded successfully."
        })
  
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to vote answer."
        })
    }
  })

  export default answerRouter