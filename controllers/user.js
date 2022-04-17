import User from "../models/user.js";
 import Blog from "../models/blog.js";
import _ from "lodash";
import formidable from "formidable";
import fs from "fs";
import slugify from "slugify";
import {errorHandler} from "../helpers/dbErrorHandler.js";
import probe from "probe-image-size";

export const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.photo = undefined;
    return res.json(req.profile);
};

export const removeUser = (req, res) => {
    const _id = req.params._id
    User.findByIdAndRemove({_id}, function (err) {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        } else {
            res.json("User deleted successfully");
        }
    });
};

export const readForAdmin = (req, res) => {
    const _id = req.params._id
    User.findById({_id})
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }

            data.hashed_password = undefined;
            data.photo = undefined;
            data.salt = undefined;
            data.createdAt = undefined;
            data.updatedAt = undefined;
            return res.json(data);
        });

};


export const publicProfile = (req, res) => {
    let username = req.params.username;
    let user;
    let blogs;

    User.findOne({username}).exec((err, userFromDB) => {
        if (err || !userFromDB) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        user = userFromDB;
        let userId = user._id;
        Blog.find({postedBy: userId})
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .limit(10)
            .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                user.photo = undefined;
                user.hashed_password = undefined;
                res.json({
                    user,
                    blogs: data
                });
            });
    });
};


// export const update = (req, res) => {
//     let form = new formidable.IncomingForm();
//     form.keepExtension = true;
//     form.parse(req, (err, fields, files) => {
//         if (err) {
//             return res.status(400).json({
//                 error: 'Photo could not be uploaded'
//             });
//         }
//
//         let user = req.profile;
//         // user's existing role and email before update
//
//         let existingRole = user.role;
//         let existingEmail = user.email;
//
//         if (fields && fields.username && fields.username.length > 12) {
//             return res.status(400).json({
//                 error: 'Username should be less than 12 characters long'
//             });
//         }
//
//         if (fields.username) {
//             fields.username = slugify(fields.username).toLowerCase();
//         }
//
//         if (fields.password && fields.password.length < 6) {
//             return res.status(400).json({
//                 error: 'Password should be min 6 characters long'
//             });
//         }
//
//         user = _.extend(user, fields);
//         // user's existing role and email - dont update - keep it same
//         user.role = existingRole;
//         user.email = existingEmail;
//
//         if (files.photo) {
//             let data = require('fs').readFileSync(files.photo.path);
//             const {width, height} = probe.sync(data)
//             const photoDimensions = {width, height}
//             if (files.photo.size > 1000000) {
//                 return res.status(400).json({
//                     error: 'Profile Image should be less than 1mb'
//                 });
//             }
//             user.photo.data = fs.readFileSync(files.photo.path);
//             user.photo.contentType = files.photo.type;
//             user.photoDimensions = photoDimensions
//         }
//
//         user.save((err, result) => {
//             if (err) {
//                 console.log('profile update error', err);
//                 return res.status(400).json({
//                     error: errorHandler(err)
//                 });
//             }
//             user.hashed_password = undefined;
//             user.salt = undefined;
//             user.photo = undefined;
//             res.json(user);
//         });
//     });
// };


export const singleUpdate = (req, res) => {
    const _id = req.params._id
    User.findById({_id}).exec((err, oldUser) => {
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

                if (fields && fields.username && fields.username.length > 12) {
                    return res.status(400).json({
                        error: 'Username should be less than 12 characters long'
                    });
                }

                if (fields.username) {
                    fields.username = slugify(fields.username).toLowerCase();
                }


                if (fields.password && fields.password.length < 6) {
                    return res.status(400).json({
                        error: 'Password should be min 6 characters long'
                    });
                }

                if (fields.password && fields.password.length < 6) {
                    return res.status(400).json({
                        error: 'Password should be min 6 characters long'
                    });
                }
                let existingRole = oldUser.role;
                let existingEmail = oldUser.email;
                oldUser = _.extend(oldUser, fields);
                oldUser.role = existingRole;
                oldUser.email = existingEmail;

                if (files.photo) {
                    let data = fs.readFileSync(files.photo.path);
                    const {width, height} = probe.sync(data)
                    const dimensions = {width, height}

                    if (files.photo.size > 2000000) {
                        return res.status(400).json({
                            error: 'Profile Image should be less than 2mb '
                        });
                    }
                    oldUser.photo.data = fs.readFileSync(files.photo.path);
                    oldUser.photo.contentType = files.photo.type;
                    oldUser.photoDimensions = dimensions

                }

                oldUser.save((err, result) => {
                    if (err) {
                        console.log('profile update error', err);
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    oldUser.hashed_password = undefined;
                    oldUser.salt = undefined;
                    oldUser.photo = undefined;
                    res.json(oldUser);
                })
            }
        )


    })


}


export const photo = (req, res) => {
    const username = req.params.username;
    User.findOne({username}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (user.photo.data) {
            res.set('Content-Type', user.photo.contentType);
            return res.send(user.photo.data)
        }

    });
};

export const list = (req, res) => {
    User.find({})
        .select('_id name username  email role profile')

        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            return res.send(users);
        });
}


