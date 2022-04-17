import express from "express";

import {adminMiddleware, authMiddleware, requireSignin} from "../controllers/auth.js";

import {
    list,
    photo,
    read,
    readForAdmin,
    removeUser,
    singleUpdate,
    publicProfile

} from "../controllers/user.js";

const router = express.Router()


router.get('/user/profile', requireSignin, authMiddleware, read);
router.get('/user/:username', publicProfile);
router.put('/single-user/:_id', requireSignin, authMiddleware, singleUpdate);
router.get('/user/photo/:username', photo);


//admin routes
router.get('/all-users', requireSignin, adminMiddleware, list);
router.get('/single-user/:_id', requireSignin, adminMiddleware, readForAdmin);
router.delete('/single-user/:_id', requireSignin, adminMiddleware, removeUser);
router.put('/single-user/:_id', requireSignin, adminMiddleware, singleUpdate);

export default router;
