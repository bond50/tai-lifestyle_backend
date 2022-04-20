const {errorHandler} = require("../helpers/dbErrorHandler.js");

export function tagRead(slug, res, tag, model) {

    tag.findOne({slug}).exec((err, tag) => {
        if (err) {
            return res.status(400).json({
                error: 'Tag not found'
            });
        }
        // res.json(tag);
        model.find({tags: tag})
            .populate('tags', '_id name  slug')
            .populate('uploadedBy', '_id name username')
            .select('_id uploadedBy tags createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({tag: tag, files: data});
            });
    });
}