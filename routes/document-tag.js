import express from "express";

// validators
import {runValidation} from "../validators/index.js";

import {createTagValidator} from "../validators/tag.js";

import {create, list, read, remove} from "../controllers/document-tag.js";


// controllers
import {adminMiddleware, requireSignin} from "../controllers/auth.js";

const router = express.Router();




// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/document-tag', createTagValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/document-tags', list);
router.get('/document-tag/:slug', read);
router.delete('/document-tag/:slug', requireSignin, adminMiddleware, remove);
export default router;