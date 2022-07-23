import express from "express";
import {
    create,
    list,
    listAllServicesCategoriesTags, listFeatured,
    listRelated,
    listServiceNamesAndSlugs,
    photo,
    read,
    remove,
    update
} from '../controllers/services.js'

import {adminMiddleware, requireSignin,} from '../controllers/auth.js'

const router = express.Router();

router.post('/service', requireSignin, adminMiddleware, create);
router.get('/services', list);
router.get('/featured-services', listFeatured);
router.get('/service-categories-tags', listAllServicesCategoriesTags);
router.get('/service/:slug', read);
router.delete('/service/:slug', requireSignin, adminMiddleware, remove);
router.put('/service/:slug', requireSignin, adminMiddleware, update);
router.get('/service/photo/:slug', photo);
router.post('/service/related', listRelated);
router.get('/list-service-names-slugs', listServiceNamesAndSlugs);


export default router;
