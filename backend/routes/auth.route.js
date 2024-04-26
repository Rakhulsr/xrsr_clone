import express from "express";
import {
  signUp,
  login,
  logOut,
  getMe,
} from "../controllers/auth.controller.js";
import { protectedMe } from "../middleware/protectedMe.js";

const router = express.Router();

router.get("/me", protectedMe, getMe);

router.post("/signup", signUp);

router.post("/login", login);

router.post("/logout", logOut);

export default router;
