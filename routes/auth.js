import {forgotPassword, preSignup, resetPassword, signin, signout, signup} from "../controllers/auth.js";


//validators
import {runValidation} from "../validators/index.js";

import express from 'express'
import {
    forgotPasswordValidator,
    resetPasswordValidator,
    userSigninValidator,
    userSignupValidator
} from '../validators/auth.js'

const router = express.Router()

router.post('/pre-signup', userSignupValidator, runValidation, preSignup)
router.post('/signup', signup)
router.post('/signin', userSigninValidator, runValidation, signin)
router.get('/signout', signout)
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword)
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword)


export default router;
