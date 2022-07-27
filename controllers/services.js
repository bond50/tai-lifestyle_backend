import Page from '../models/services.js'
import Category from '../models/serviceCategory.js'
import formidable from 'formidable'
import slugify from 'slugify'
import stripHtml from 'string-strip-html'
import _ from 'lodash'
import {errorHandler} from '../helpers/dbErrorHandler.js'
import fs from 'fs'
import {smartTrim} from '../helpers/blog.js'
import User from "../models/user.js"
import sizeOf from 'image-size'
import {capitalizeFirstLetter} from "../helpers/importantFunctions.js"


export const create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }
        const {title, body, categories} = fields;


        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }


        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }
        const dimensions = sizeOf(fs.readFileSync(files.photo.path))

        let page = new Page();
        page.title = title.toLowerCase();
        page.body = body;
        page.excerpt = smartTrim(body, 320, ' ', ' ...');
        page.slug = slugify(title).toLowerCase();
        page.metaTitle = `${title} | ${process.env.APP_NAME}`;
        page.metaDesc = stripHtml(body.substring(0, 160));
        page.postedBy = req.auth._id;
        page.imgHeight = dimensions.height
        page.imgWidth = dimensions.width
        page.imgType = dimensions.type
        let arrayOfCategories = categories && categories.split(',');


        if (files.photo) {
            if (files.photo.size > 2000000) {
                return res.status(400).json({
                    error: 'Image should be less then 2 mb in size'
                });
            }
            page.photo.data = fs.readFileSync(files.photo.path);
            page.photo.contentType = files.photo.type;
        }

        page.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            Page.findByIdAndUpdate(result._id, {$push: {categories: arrayOfCategories}}, {new: true}).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    } else {
                        res.json(result);
                    }
                }
            );
        });
    })
}
export const listFeatured = (req, res) => {
    Page.find({featured: true, accepted: true})
        .select('_id title imgWidth imgHeight icon excerpt slug')
        .sort({updatedAt: -1})
        .limit(3)
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
}
export const list = (req, res) => {
    Page.find({accepted: true})
        .populate('categories', '_id name slug')
        .populate('postedBy', '_id name username')
        .sort({updatedAt: -1})
        .select('_id title slug imgWidth imgHeight excerpt categories  postedBy createdAt updatedAt')
        .sort({createdAt: -1})
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};


export const listAllServicesCategoriesTags = (req, res) => {
    let pages;
    let categories;
    let tags;

    Page.find({accepted: true})
        .populate('categories', '_id name slug')
        .populate('postedBy', '_id name username profile')
        .sort({updatedAt: -1})
        .select('_id title imgWidth imgHeight slug excerpt  categories postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            pages = data;
            // get all categories
            Category.find({}).exec((err, c) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                categories = c; // categories

                res.json({pages, categories, size: pages.length});
            });
        });
};

export const photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Page.findOne({slug})
        .select('photo')
        .exec((err, service) => {
            if (err || !service) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', service.photo.contentType);
            return res.send(service.photo.data);
        });
};


export const read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Page.findOne({slug})
        // .select("-photo")
        .populate('categories', '_id name slug')
        .populate('postedBy', '_id name username')
        .sort({updatedAt: -1})
        .select('_id title body accepted icon featured excerpt slug metaTitle metaDesc categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};


export const listServiceNamesAndSlugs = (req, res) => {
    Page.find({})
        .sort({createdAt: -1})
        .select('_id title imgWidth imgHeight slug')
        .sort({updatedAt: -1})
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};


export const listRelated = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 30;
    const {_id, categories} = req.body.service;


    Page.find({_id: {$ne: _id}, categories: {$in: categories}})
        .limit(limit)
        .select('title slug imgWidth imgHeight ')
        .sort({updatedAt: -1})
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: 'Services not found'
                });
            }
            res.json(blogs);
        });
};


export const remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Page.findOneAndRemove({slug}).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        data.photo = undefined
        res.json({
            message: `${capitalizeFirstLetter(data.title)} page deleted successfully`
        });
    });
};


export const update = (req, res) => {

    const slug = req.params.slug.toLowerCase();

    Page.findOne({slug}).exec((err, oldPage) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'Image could not upload'
                });
            }


            let slugBeforeMerge = oldPage.slug;
            oldPage = _.merge(oldPage, fields);
            oldPage.slug = slugBeforeMerge;


            const {body, desc, categories, tags} = fields;

            if (body) {
                oldPage.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldPage.desc = stripHtml(body.substring(0, 160));
            }

            if (categories) {
                oldPage.categories = categories.split(',');
            }



            if (files.photo) {
                 const dimensions = sizeOf(fs.readFileSync(files.photo.path))
                if (files.photo.size > 2000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 2mb in size'
                    });
                }
                oldPage.photo.data = fs.readFileSync(files.photo.path);
                oldPage.photo.contentType = files.photo.type;
                oldPage.imgHeight = dimensions.height
                oldPage.imgWidth = dimensions.width
                oldPage.imgType = dimensions.type
            }

            oldPage.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                // result.photo = undefined;
                res.json(result);
            });
        });
    });
};

