import User from "../models/team.js";
import _ from "lodash";
import formidable from "formidable";
import fs from "fs";
import {errorHandler} from "../helpers/dbErrorHandler.js";
import probe from "probe-image-size";
import shortId from "shortid";



export const create = (req, res) => {
    const {name, email, about, facebook, twitter, companyRole, instagram} = req.body
    let username = shortId.generate();
    const newUser = new User({name, email, about, companyRole, username, facebook, twitter, instagram});
    newUser.save((err, doc) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            return res.json({
                message: 'User added successfully.'
            });
        }
    )
}


export const listSingle = (req, res) => {
    let username = req.params.username;
    let user;

    User.findOne({username}).exec((err, userFromDB) => {

        if (err || !userFromDB) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        user = userFromDB;
        user.photo = undefined;
        res.json({
            user,
        });

    });
};

export const removeUser = (req, res) => {
    const _id = req.params._id
    User.findByIdAndRemove({_id}, function (err) {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        } else {
            res.json("Team member deleted successfully");
        }
    });
};


export const update = (req, res) => {
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

                oldUser = _.extend(oldUser, fields);


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
        .select('_id  name photoDimensions companyRole instagram facebook username twitter email')
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            return res.send(users);
        });
}


export const read = (req, res) => {
    const _id = req.params._id
    User.findById({_id})
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }

            data.photo = undefined;
            data.createdAt = undefined;
            data.updatedAt = undefined;
            return res.json(data);
        });

};
