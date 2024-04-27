import express from "express";

import { protectedMe } from "../middleware/protectedMe.js";
import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUser,
  updateUser,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/profile/:username", protectedMe, getUserProfile);
router.get("/suggested", protectedMe, getSuggestedUser);
router.post("/follow/:id", protectedMe, followUnfollowUser);
router.post("/update", protectedMe, updateUser);

export default router;
