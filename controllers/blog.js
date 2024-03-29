import Blog from '../models/blog.js'
import Category from '../models/category.js'
import Tag from '../models/tag.js'
import User from '../models/user.js'
import formidable from 'formidable'
import slugify from 'slugify'
import stripHtml from 'string-strip-html'
import _ from 'lodash'
import {errorHandler} from '../helpers/dbErrorHandler.js'
import fs from 'fs'
import {smartTrim} from '../helpers/blog.js'
import sizeOf from 'image-size'

export const create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }

        const {title, body, categories, tags} = fields;


        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }

        if (!body || body.length < 200) {
            return res.status(400).json({
                error: 'Content is too short'
            });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }

        if (!tags || tags.length === 0) {
            return res.status(400).json({
                error: 'At least one tag is required'
            });
        }
        let blog = new Blog();
        blog.approved = false;
        blog.title = title;
        blog.body = body;
        blog.excerpt = smartTrim(body, 320, ' ', ' ...');
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.mdesc = stripHtml(body.substring(0, 160));
        blog.postedBy = req.auth._id;
        // categories and tags
        let arrayOfCategories = categories && categories.split(',');
        let arrayOfTags = tags && tags.split(',');

        const dimensions = sizeOf(fs.readFileSync(files.photo.path))


        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
            blog.imgHeight = dimensions.height
            blog.imgWidth = dimensions.width
            blog.imgType = dimensions.type
        }

        blog.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            // res.json(result);

            Blog.findByIdAndUpdate(result._id, {$push: {categories: arrayOfCategories}}, {new: true}).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    } else {
                        Blog.findByIdAndUpdate(result._id, {$push: {tags: arrayOfTags}}, {new: true}).exec(
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
                    }
                }
            );
        });
    })
}


export const list = (req, res) => {
    Blog.find({accepted: true})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .sort({updatedAt: -1})
        .select('_id title slug excerpt imgWidth imgHeight categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};


export const listAllBlogsCategoriesTags = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 4;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let blogs;
    let categories;
    let tags;

    Blog.find({accepted: true})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username profile')
        .sort({updatedAt: -1})
        .skip(skip)
        .limit(limit)
        .select('_id title accepted slug imgWidth imgHeight excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            blogs = data; // blogs
            // get all categories
            Category.find({}).exec((err, c) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                categories = c; // categories
                // get all tags
                Tag.find({}).exec((err, t) => {
                    if (err) {
                        return res.json({
                            error: errorHandler(err)
                        });
                    }
                    tags = t;
                    // return all blogs categories tags
                    res.json({blogs, categories, tags, size: blogs.length});
                });
            });
        });
};

export const read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({slug})
        // .select("-photo")
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title body imgWidth imgHeight imgType accepted featured slug mtitle mdesc categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};


export const remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOneAndRemove({slug}).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Blog deleted successfully'
        });
    });
};

export const update = (req, res) => {

    const slug = req.params.slug.toLowerCase();

    Blog.findOne({slug}).exec((err, oldBlog) => {
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


            let slugBeforeMerge = oldBlog.slug;
            oldBlog = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;

            const {body, categories, tags} = fields;


            if (body) {
                oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldBlog.desc = stripHtml(body.substring(0, 160));
            }

            if (categories) {
                oldBlog.categories = categories.split(',');
            }

            if (tags) {
                oldBlog.tags = tags.split(',');
            }


            if (files.photo) {

                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }

                const dimensions = sizeOf(fs.readFileSync(files.photo.path))
                oldBlog.photo.data = fs.readFileSync(files.photo.path);
                oldBlog.photo.contentType = files.photo.type;
                oldBlog.imgHeight = dimensions.height
                oldBlog.imgWidth = dimensions.width
                oldBlog.imgType = dimensions.type

            }

            oldBlog.save((err, result) => {
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

export const photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({slug})
        .select('photo')
        .exec((err, blog) => {
            if (err || !blog) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', blog.photo.contentType);
            return res.send(blog.photo.data);
        });
};

export const listRelated = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    const {_id, categories} = req.body.blog;

    Blog.find({_id: {$ne: _id}, categories: {$in: categories}}, {status: 'approved'})
        .limit(limit)
        .populate('postedBy', '_id name  username profile')
        .sort({updatedAt: -1})
        .select('title imgWidth imgHeight slug excerpt postedBy createdAt updatedAt')
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: 'Blogs not found'
                });
            }
            res.json(blogs);
        });
};
export const listSearch = (req, res) => {
    const {search} = req.query;
    if (search) {
        Blog.find(
            {
                $or: [{title: {$regex: search, $options: 'i'}}, {body: {$regex: search, $options: 'i'}}]
            },
            (err, blogs) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(blogs);
            }
        ).select('-photo -body');

    }
};

export const listByUser = (req, res) => {
    User.findOne({username: req.params.username}).exec(
        (err, user) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            Blog.find({postedBy: user._id, accepted: true})
                .populate('categories', '_id name slug')
                .populate('tags', '_id name slug')
                .populate('postedBy', '_id name username')
                .sort({updatedAt: -1})
                .select('_id title accepted  slug postedBy createdAt updatedAt')
                .exec((err1, data) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json(data)
                })

        })

}


export const listHomePageBlogs = (req, res) => {
    Blog.find({accepted: true})
        .populate('postedBy', '_id name')
        .sort({updatedAt: -1})
        .limit(6)
        .select('_id title slug imgWidth postedBy imgHeight excerpt createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};




export const featuredBlogs = (req, res) => {
    Blog.find({featured: true, accepted: true})
        .populate('postedBy', '_id name ')
        .select('_id title imgWidth postedBy imgHeight excerpt slug name ')
        .sort({updatedAt: -1})
        .limit(10)
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
}
