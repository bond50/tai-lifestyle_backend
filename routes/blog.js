import express from "express";

const router = express.Router();
import {
    create,
    list,
    listAllBlogsCategoriesTags,
    read,
    listHomePageBlogs,
    listByUser,
    listPendingByUser,
    remove,
    update,
    photo,
    listRelated,
    listSearch,
    featuredBlogs,
    listPending
}  from '../controllers/blog.js'

import {requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteBlog}  from '../controllers/auth.js'


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
