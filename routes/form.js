import express from "express";

import {contactBlogAuthorForm, contactForm} from "../controllers/form.js";


// validators
import {runValidation} from "../validators/index.js";

import {contactFormValidator} from "../validators/form.js";

const router = express.Router();


router.post("/contact", contactFormValidator, runValidation, contactForm);
router.post(
    "/contact-blog-author",
    contactFormValidator,
    runValidation,
    contactBlogAuthorForm
);

export default router;
