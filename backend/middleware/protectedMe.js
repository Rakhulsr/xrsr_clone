import "dotenv/config";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
export const protectedMe = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unautorized: You must login first " });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unautorized: Invalid token" });
    }
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Error message in ProtectMe: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
