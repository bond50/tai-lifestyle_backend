import Tag from "../models/document-tag.js";
import Document from "../models/document.js";
import {tagCatCreate} from "../helpers/tagcatCreate.js";
import {tagDelete} from "../helpers/tag-delete.js";
import {errorHandler} from "../helpers/dbErrorHandler.js";


export const create = (req, res) => {
    const {name} = req.body;
    tagCatCreate(Tag, name, res)
};


export const list = (req, res) => {
    Tag.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        console.log(data)
        res.json(data);
    });
};


export const read = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOne({slug}).exec((err, tag) => {
        if (err) {
            return res.status(400).json({
                error: 'Tag not found'
            });
        }
        // res.json(tag);
        Document.find({tags: tag,})
            .populate('tags', '_id name  slug')
            .populate('postedBy', '_id name username')
            .select('_id title slug fileType fileSize excerpt postedBy tags createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({tag: tag, files: data});
            });
    });
};
export const remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    tagDelete(slug, res, Tag)

};