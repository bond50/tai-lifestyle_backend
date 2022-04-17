import express from "express";
// controllers
import {adminMiddleware, requireSignin} from '../controllers/auth.js'
import {create, list, read, remove} from '../controllers/tag.js'

// validators
import {runValidation} from '../validators/index.js'
import {createTagValidator} from '../validators/tag.js'

const router = express.Router();

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/tag', createTagValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/tags', list);
router.get('/tag/:slug', read);
router.delete('/tag/:slug', requireSignin, adminMiddleware, remove);

export default router;