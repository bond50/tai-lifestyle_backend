import {check} from "express-validator";


export const userSignupValidator = [
    check('name', 'Name is required')
        .notEmpty(),
    check('email', 'Email address is required')
        .notEmpty()
        .isEmail()
        .withMessage('Must be a valid email address'),
    check("password", "Password is required")
        .notEmpty()
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long')
        .isLength({
            max: 20
        })
        .withMessage("Password can contain max 20 characters")
    ,
    check('password1', 'Confirmation password cannot be empty')
        .notEmpty()
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match')
            }
            return true;
        })
];

export const userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long')
];


export const forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address'),
];

export const resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long')

];