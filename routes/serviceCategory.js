import express from "express";



const router = express.Router()

//validators
import {runValidation} from '../validators/index.js'
import {categoryCreateValidator} from "../validators/category.js";


import {adminMiddleware, requireSignin} from "../controllers/auth.js";

import {create, list, read, readCatNames, remove} from "../controllers/serviceCategories.js";

router.post('/service-category', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create)
router.get('/service-categories', list);
router.get('/service-category/:slug', read);
router.get('/service-category-name/:slug', readCatNames);
router.delete('/service-category/:slug', requireSignin, adminMiddleware, remove);

export default router;
