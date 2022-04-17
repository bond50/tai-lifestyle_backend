import Value from "../models/value.js"
import {errorHandler} from "../helpers/dbErrorHandler.js"


export const create = (req, res) => {
    const {title, content} = req.body
    let value = new Value({title, content})
    value.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(data)
    })
};
export const list = (req, res) => {
    Value.find()
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });

};

