import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { isValidEmail } from "../lib/utils/emailValidator.js";

export const signUp = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid Email Format" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already used" });
    }

    const exitingUser = await User.findOne({ username });
    if (exitingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    //hash password

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be 8 character" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
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
      });
    } else {
      res.status(500).json({ error: "invalid user data" });
    }
  } catch (error) {
    console.error(`Error message: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Invalid login in user" });
    }
    const isPassword = await bcrypt.compare(password, user?.password);
    if (!isPassword) return res.status(400).json({ error: "invalid password" });

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.cover,
    });
    // console.log("successfully login");
  } catch (error) {
    console.error(`Error in login controller : ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Log Out succesfully" });
  } catch (error) {
    console.error(`Error in login controller : ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error("error from auth getMe:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
