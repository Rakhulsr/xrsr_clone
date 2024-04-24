import express from "express"
import { signUp, login, logOut } from "../controllers/auth.controller.js"

const router = express.Router()

router.get("/", (req, res) => {
  res.send("home")
})

router.post("/signup", signUp)

router.post("/login", login)

router.post("/logout", logOut)

export default router
