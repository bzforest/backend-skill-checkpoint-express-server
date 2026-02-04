export const validateCreateQuestion = (req, res, next) => {

    if (!req.body.title || !req.body.description) {
        return res.status(400).json({
            message: "Invalid request data."
        })
    }

    const categoryList = ["Software", "Food", "Travel", "Science", "Etc."]
    const hasCategoryList = categoryList.includes(req.body.category)

    if (!hasCategoryList) {
        return res.status(400).json({
            message: "Invalid request data."
        })
    }
    next();
}

export const validateCreateAnswer = (req, res, next) => {

    if (req.body.content.length > 300) {
        return res.status(400).json({
            message: "maximun of 300 characters"
        })
    }
    next();
}

export const validateVote = (req, res, next) => {

    if (req.body.vote !== 1 && req.body.vote !== -1) {
        return res.status(400).json({
            message: "Invalid vote value."
        })
    }
    next();
}