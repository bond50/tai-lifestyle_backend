import User from '../models/user.js'
import Service from '../models/services.js'
import shortId from 'shortid'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import expressJwt from 'express-jwt'
import {errorHandler} from "../helpers/dbErrorHandler.js"
import {OAuth2Client} from 'google-auth-library'
import sgMail from "@sendgrid/mail"
import Blog from "../models/blog.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


export const preSignup = (req, res) => {
    const {name, email, password, role} = req.body
    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }

        const token = jwt.sign({name, email, password, role}, process.env.JWT_ACCOUNT_ACTIVATION, {expiresIn: '10m'})
        const emailData = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `Account activation link`,
            html: `
            <p>Please use the following link to activate your account.The link expires after 10 minutes</p>
            <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
           <br>
          
            <p>This email may contain sensetive information</p>
            <p>https://tailifestile.com</p>`
        }
        sgMail.send(emailData).then(sent => {
            return res.json({
                message: `Account activation link has been sent to ${email}.The user must confirm his/her email address within 10 minutes.`
            });
        });
    })
}

export const signup = (req, res) => {
    const token = req.body.token
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: "Link expired.Sign up again"

                });
            }
            const {name, email, password, role} = jwt.decode(token)
            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;

            const newUser = new User({name, email, password, profile, username, role});
            newUser.save((err, doc) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                return res.json({
                    message: 'User added successfully.'
                });
            })

        })
    } else {
        return res.json({
            message: 'Something went wrong try again'
        });
    }
}


export const signin = (req, res) => {
    const {email, password} = req.body;
    // check if user exist
    User.findOne({email}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist.'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password do not match.'
            });
        }
        // generate a token and send to client
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

        res.cookie('token', token, {expiresIn: '1d'});
        const {_id, username, name, email, role} = user;
        return res.json({
            token,
            user: {_id, username, name, email, role}
        });
    });
};
export const signout = (req, res) => {
    res.clearCookie('token');
    res.json({
        message: 'Signout success'
    });
};

export const requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // added later
    userProperty: "auth",
});

export const authMiddleware = (req, res, next) => {
    const authUserId = req.auth._id;
    User.findById({_id: authUserId}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user;
        next();
    });
};

export const adminMiddleware = (req, res, next) => {
    const adminUserId = req.auth._id;
    User.findById({_id: adminUserId}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (user.role !== 1) {
            return res.status(400).json({
                error: 'You are lost.Access denied'
            });
        }
        req.profile = user;
        next();
    });
};

export const canUpdateDeletePage = (req, res, cb) => {
    const slug = req.params.slug.toLowerCase();
    Service.findOne({slug}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'You are not authorized'
            });
        }
        cb();
    });
}

export const forgotPassword = (req, res) => {
    const {email} = req.body;
    User.findOne({email}, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: 'User with that email does not exist'
            });
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'});

        // email
        const emailData = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: `Password reset link`,
            html: `
            <p>Please use the following link to reset your password:</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://vihigahospital.go.ke</p>
        `
        };
        // populating the db > user > resetPasswordLink
        return user.updateOne({resetPasswordLink: token}, (err, success) => {
            if (err) {
                return res.json({error: errorHandler(err)});
            } else {
                sgMail.send(emailData).then(sent => {
                    return res.json({
                        message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10min.`
                    });
                });
            }
        });
    });
};


export const resetPassword = (req, res) => {
    const {resetPasswordLink, newPassword} = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Try again'
                });
            }
            User.findOne({resetPasswordLink}, (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Something went wrong. Try later'
                    });
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }

                    res.json({
                        message: `Great! Now you can login with your new password`
                    });
                });
            });
        });
    }

};


export const canUpdateDeleteBlog = (req, res, cb) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({slug}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'You are not authorized'
            });
        }
        cb();
    });
}