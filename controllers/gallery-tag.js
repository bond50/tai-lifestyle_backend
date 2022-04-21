import Tag from "../models/gallery-tag.js";
import {tagCatCreate} from "../helpers/tagcatCreate.js";
import {tagDelete} from "../helpers/tag-delete.js";
import Gallery from "../models/gallery.js";
import Blog from "../models/blog.js";

import {errorHandler} from "../helpers/dbErrorHandler.js"

export function create(req, res) {
    const {name} = req.body;
    tagCatCreate(Tag, name, res)
}

export const list = (req, res) => {
    Tag.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};


// exports.read = (req, res) => {
//     const slug = req.params.slug.toLowerCase();
//     tagRead(slug, res, Tag, Gallery)
// };

export const remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    tagDelete(slug, res, Tag)
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
        Gallery.find({tags: tag})
            .populate('tags', '_id name  slug')
            .populate('uploadedBy', '_id name username')
            .select('_id filePath title cloudinaryFolder publicId tags fileName fileType fileSize createdAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({tag: tag, data: data});
            });
    });
};