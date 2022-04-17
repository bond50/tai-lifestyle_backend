import express from "express";
import {adminMiddleware, requireSignin} from "../controllers/auth.js";

import {create, list, listSingle, photo, read, removeUser, update} from "../controllers/team.js";


const router = express.Router()


router.post('/team-member', create);
router.get('/team-member/:_id', requireSignin, adminMiddleware, read);
router.get('/team-members', list);
router.get('/team/:username', listSingle);
router.get('/member/photo/:username', photo);
router.delete('/team-member/:_id', requireSignin, adminMiddleware, removeUser);
router.put('/team-member/:_id', requireSignin, adminMiddleware, update);

export default router;
