import bcrypt from "bcryptjs";
import { v2 } from "cloudinary";

import User from "../models/user.model.js";
import Notification from "../models/notif.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      res.status(404).json({ error: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("error in getUserProfile", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      res.status(200).json({ message: "User successfully unfollowed" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // Kirim notifikasi

      const newNotif = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotif.save();
      // TODO

      res.status(200).json({ message: "User Successfully Followed" });
    }
  } catch (error) {
    console.error("error in followUnfollowUser", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("error in getSuggestedUser", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { username, fullname, currentPassword, newPassword, bio, email, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found" });
    //change password

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "please provide current and new password" });
    }

    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "invalid current password" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "new password must have at least 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    //profile img

    if (profileImg) {
      if (user.profileImg) {
        await v2.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadRes = await v2.uploader.upload(profileImg);
      profileImg = uploadRes.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await v2.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
      const uploadRes = await v2.uploader.upload(coverImg);
      coverImg = uploadRes.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    console.error("error in updateProfile", error.message);
    res.status(500).json({ error: error.message });
  }
};
