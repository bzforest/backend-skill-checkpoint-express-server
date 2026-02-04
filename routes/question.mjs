import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreateQuestion } from "../middleware/validateForm.mjs";
import { validateCreateAnswer } from "../middleware/validateForm.mjs";

const questionRouter = Router();

questionRouter.post("/", [validateCreateQuestion] ,async (req, res) => {

    // if (!req.body.title || !req.body.description || !req.body.category) {
    //     return res.status(400).json({
    //         message: "Invalid request data."
    //     })
    // }

    try {

        const newQuestion = {
            ...req.body,
        };

        await connectionPool.query(`INSERT INTO questions(title , description , category)  values($1 , $2 , $3)`,
            [
                newQuestion.title,
                newQuestion.description,
                newQuestion.category,
            ]
        );

        return res.status(201).json({
            message: "Question created successfully."
        })

    } catch (error) {
        return res.status(500).json({
            message: "Unable to create question."
        })
    }
})

questionRouter.get("/", async (req, res) => {
    try {
        const results = await connectionPool.query(`SELECT * FROM questions`)
        return res.status(200).json({
            data: results.rows
        })

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch questions."
        })
        console.log(error)
    }
})

questionRouter.get("/search", async (req, res) => {

    const { title, category } = req.query;
    let query = 'SELECT * FROM questions';
    let values = [];

    if (!title && !category) {
        return res.status(400).json({
            message: "Invalid search parameters."
        })
    }

    try {
        if (title && category) {
            query += ' WHERE title ILIKE $1 AND category ILIKE $2';
            values = [`%${title}`, `%${category}`];
        } else if (title) {
            query += ' WHERE title ILIKE $1';
            values = [`%${title}`];
        } else if (category) {
            query += ' WHERE category ILIKE $1';
            values = [`%${category}`];
        }
        const results = await connectionPool.query(query, values);
        return res.status(200).json({
            data: results.rows
        })

    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch a question."
        })
    }
})

questionRouter.get("/:questionId", async (req, res) => {

    const { questionId } = req.params;

    try {
        const results = await connectionPool.query(`SELECT * FROM questions WHERE id = $1`, [questionId])

        if (!results.rows[0]) {
            return res.status(404).json({
                message: "Question not found."
            })
        }

        return res.status(200).json({
            data: results.rows[0]
        })

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch questions."
        })
        console.log(error)
    }
})

questionRouter.put("/:questionId", [validateCreateQuestion] ,async (req, res) => {

    const { questionId } = req.params;

    // if (!req.body.title || !req.body.description || !req.body.category) {
    //     return res.status(400).json({
    //         message: "Invalid request data."
    //     })
    // }

    const updateQuestion = {
        ...req.body,
    }

    try {
        const results = await connectionPool.query(`
            UPDATE questions
            SET title = $2,
                description = $3,
                category = $4
            WHERE id = $1
            RETURNING *` ,
            [
                questionId,
                updateQuestion.title,
                updateQuestion.description,
                updateQuestion.category,
            ]);

        if (!results.rows[0]) {
            return res.status(404).json({
                message: "Question not found."
            })
        }
        return res.status(200).json({
            message: "Question updated successfully."
        })

    } catch (error) {
        return res.status(500).json({
            message: "Unable to update questions."
        })
    }
})

questionRouter.delete("/:questionId", async (req, res) => {

    const { questionId } = req.params;

    try {

        await connectionPool.query(`DELETE FROM answers WHERE question_id = $1` , [questionId])

        const results = await connectionPool.query(`DELETE FROM questions WHERE id = $1 RETURNING *`, [questionId])

        if (!results.rows[0]) {
            return res.status(404).json({
                message: "Question not found."
            })
        }
        return res.status(200).json({
            message: "Question post has been deleted successfully."
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Unable to delete question."
        })
    }
})

questionRouter.post("/:questionId/answers", [validateCreateAnswer] ,async (req, res) => {

    const { questionId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({
            message: "Invalid request data."
        })
    }

    try {
        const results = await connectionPool.query(`SELECT * FROM questions WHERE id = $1`, [questionId]);

        if (!results.rows[0]) {
            return res.status(404).json({
                message: "Question not found."
            })
        }

        await connectionPool.query(`INSERT INTO answers(question_id , content) values($1 , $2)`, [questionId, content]);
        return res.status(201).json({
            message: "Answer created successfully."
        })

    } catch (error) {
        return res.status(500).json({
            message: "Unable to create answers."
        })
    }
})

questionRouter.get("/:questionId/answers", async (req, res) => {

    const { questionId } = req.params;

    try {
        const questionCheck = await connectionPool.query(`SELECT * FROM questions WHERE id = $1`, [questionId])
        if (!questionCheck.rows[0]) {
            return res.status(404).json({
                message: "Question not found."
            })
        }
        const results = await connectionPool.query(`SELECT * FROM answers WHERE question_id = $1`, [questionId])
        return res.status(200).json({
            data: results.rows
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to fetch answers."
        })
    }
})

questionRouter.delete("/:questionId/answers", async (req, res) => {

    const { questionId } = req.params;

    try {
        const questionCheck = await connectionPool.query(`SELECT * FROM questions WHERE id = $1`, [questionId])
        if (!questionCheck.rows[0]) {
            return res.status(404).json({
                message: "Question not found."
            })
        }

        await connectionPool.query(`DELETE FROM answers WHERE question_id = $1`, [questionId])
        return res.status(200).json({
            message: "All answers for the question have been deleted successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to delete answers."
        })
    }
})

questionRouter.post("/:questionId/vote", async (req, res) => {

    const { questionId } = req.params;
    // const { answerId } = req.params
    const { vote } = req.body;

    if (vote !== 1 && vote !== -1) {
        return res.status(400).json({
            message: "Invalid vote value."
        })
    }

    try {
        const questionCheck = await connectionPool.query(`SELECT * FROM questions WHERE id = $1`, [questionId])
        if (!questionCheck.rows[0]) {
            return res.status(404).json({
                message: "Question not found."
            })
        }

        // const answerCheck = await connectionPool.query(`SELECT * FROM answers WHERE id = $1`, [answerId])
        // if (!answerCheck.rows[0]) {
        //     return res.status(404).json({
        //         message: "Answer not found."
        //     })
        // }

        await connectionPool.query(`INSERT INTO question_votes(question_id , vote) values($1 , $2)`, [questionId ,vote]);
        return res.status(200).json({
            message: "Vote on the question has been recorded successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to vote question."
        })
    }
})

export default questionRouter