import express from "express";

import {adminMiddleware, requireSignin,} from '../controllers/auth.js'
import {create, list, read, remove} from '../controllers/category.js'
//validators
import {runValidation} from '../validators/index.js'
import {categoryCreateValidator} from '../validators/category.js'

const router = express.Router()


router.post('/category', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create)
router.get('/categories', list);
router.get('/category/:slug', read);
router.delete('/category/:slug', requireSignin, adminMiddleware, remove);

export default router;
