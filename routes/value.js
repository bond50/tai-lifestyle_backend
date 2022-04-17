import express from "express";
import {adminMiddleware, requireSignin} from "../controllers/auth.js";
import {create, list} from "../controllers/value.js";

const router = express.Router()

router.post('/core-values', requireSignin, adminMiddleware, create)
router.get('/core-values',  list)

export default router;
