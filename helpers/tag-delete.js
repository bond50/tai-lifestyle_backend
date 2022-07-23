import {errorHandler} from "./dbErrorHandler.js";


export function tagDelete(slug, res, TagModel) {
    TagModel.findOneAndRemove({slug}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Tag deleted successfully'
        });
    });
}