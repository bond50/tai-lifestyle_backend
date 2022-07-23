import express from "express";


// controllers
import {adminMiddleware, requireSignin} from "../controllers/auth.js";
import {create, list, read, remove} from "../controllers/gallery-tag.js";


// validators
import {runValidation} from "../validators/index.js";

import {createTagValidator} from "../validators/tag.js";

const router = express.Router();


// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/gallery-tag', createTagValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/gallery-tags', list);
router.get('/gallery-tag/:slug', read);
router.delete('/gallery-tag/:slug', requireSignin, adminMiddleware, remove);
export default router;