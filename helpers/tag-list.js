const {errorHandler} = require("../helpers/dbErrorHandler.js");

export function tagList(model, res) {
    model.find({})
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
}