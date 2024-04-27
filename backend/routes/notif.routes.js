import express from "express";

import { protectedMe } from "../middleware/protectedMe.js";
import { getNotif, deleteNotif } from "../controllers/notif.controller.js";

const router = express.Router();

router.get("/", protectedMe, getNotif);
router.delete("/", protectedMe, deleteNotif);

export default router;
