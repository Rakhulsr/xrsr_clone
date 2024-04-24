import User from "../models/user.model"
import bcrypt from "bcryptjs"

export const signUp = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body

    const emailRegex = / ^[^\s@]+@[^\s@]+ \.[^\s@]+ $   /
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    const exitingEmail = await User.findOne({ email })
    if (exitingEmail) {
      return res.status(400).json({ error: "Email already used" })
    }

    const exitingUser = await User.findOne({ username })
    if (exitingUser) {
      return res.status(400).json({ error: "Username is already taken" })
    }

    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullname: fullname,
      username: username,
      email: email,
      password: hashPassword,
    })

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res)

      res.status(201).json({
        _id: newUser.id,
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        bio: newUser.bio,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      })
    } else {
      res.status(500).json({ error: "invalid user data" })
    }
  } catch (error) {
    console.error(`Error message: ${error.message}`)
  }
}

export const logOut = async (req, res) => {
  res.json({
    data: "auth log out endpoint",
  })
}

export const login = async (req, res) => {
  res.json({
    data: "auth login endpoint",
  })
}
