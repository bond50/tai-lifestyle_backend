import express from "express";
const router = express.Router()
import {adminMiddleware, requireSignin} from "../controllers/auth.js";
import {create,list} from "../controllers/value.js";

router.post('/core-values', requireSignin, adminMiddleware, create)
router.get('/core-values',  list)

export default router;
