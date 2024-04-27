import express from "express";

import { protectedMe } from "../middleware/protectedMe.js";
import {
  createPost,
  deletePost,
  commentOnPost,
  likeOnPost,
  getAllPost,
  getPostLiked,
  getFollowingPost,
  getUserPosts,
} from "../controllers/posts.controller.js";

const router = express.Router();

router.get("/all", protectedMe, getAllPost);
router.get("/following", protectedMe, getFollowingPost);
router.get("/likes/:id", protectedMe, getPostLiked);
router.get("/user/:username", protectedMe, getUserPosts);

router.post("/create", protectedMe, createPost);
router.post("/like/:id", protectedMe, likeOnPost);
router.post("/comment/:id", protectedMe, commentOnPost);
router.post("/delete/:id", protectedMe, deletePost);

export default router;
