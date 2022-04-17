import express from "express";
import {
    create,
    featuredBlogs,
    list,
    listAllBlogsCategoriesTags,
    listByUser,
    listHomePageBlogs,
    listPending,
    listPendingByUser,
    listRelated,
    listSearch,
    photo,
    read,
    remove,
    update
} from '../controllers/blog.js'

import {adminMiddleware, authMiddleware, canUpdateDeleteBlog, requireSignin} from '../controllers/auth.js'

const router = express.Router();


router.post('/blog', requireSignin, adminMiddleware, create);
router.get('/blogs', list);
router.get('/featured-blogs', featuredBlogs);
router.get('/pending-blogs', requireSignin, adminMiddleware, listPending);
router.get('/list-recent-blogs', listHomePageBlogs);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignin, adminMiddleware, remove);
router.put('/blog/:slug', requireSignin, adminMiddleware, update);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch);

//auth user blog routes

router.post('/user/blog', requireSignin, authMiddleware, create);
router.get('/:username/pending-blogs', listPendingByUser);
router.get('/:username/blogs', listByUser);
router.delete('/user/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog, remove);
router.put('/user/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog, update);


export default router;
