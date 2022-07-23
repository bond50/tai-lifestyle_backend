import slugify from "slugify"
import PageCategory from "../models/serviceCategory.js"
import {errorHandler} from "../helpers/dbErrorHandler.js"
import Pages from "../models/services.js"


export const create = (req, res) => {
    const {name} = req.body
    let slug = slugify(name).toLowerCase()
    let category = new PageCategory({name, slug})
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(data)
    })
};

export const list = (req, res) => {
    PageCategory.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

export const read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    PageCategory.findOne({slug}).exec((err, category) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        Pages.find({categories: category})
            .populate('categories', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title slug excerpt categories postedBy  createdAt updatedAt')
            .exec((err, data) => {
                if (err) return res.status(400).json({
                    error: errorHandler(err)
                });
                res.json({category: category, pages: data});
            });
    });
};
export const readCatNames = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    PageCategory.findOne({slug}).exec((err, category) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        Pages.find({categories: category, accepted: true})
            .select('_id title slug')
            .exec((err, data) => {
                if (err) return res.status(400).json({
                    error: errorHandler(err)
                });
                res.json({category: category, pages: data});
            });
    });
};

export const remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    PageCategory.findOneAndRemove({slug}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Category deleted successfully'
        });
    });
};