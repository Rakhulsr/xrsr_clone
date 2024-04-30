import { v2 } from "cloudinary";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notif.model.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    if (!text && !img)
      return res.status(400).json({ message: "Post must be text or image" });

    if (img) {
      const uploadedImgRes = await v2.uploader.upload(img);
      img = uploadedImgRes.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error(`Error from createPost: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      res
        .status(400)
        .json({ message: " dont have permission to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").slice(-1)[0].split(".")[0];

      await v2.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "post deleted" });
  } catch (error) {
    console.error(`Error from deletePost: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "text must be fill" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error(`Error from commentOnPost: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likeOnPost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "post not found" });

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      //unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: "unlike the post" });
    } else {
      //like
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const likesNotif = new Notification({
        from: userId,
        to: post.User,
        type: "like",
      });
      await likesNotif.save();
      res.status(200).json({ message: "Like the post" });
    }
  } catch (error) {
    console.error(`Error from likeOnPost: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    console.error(`Error from getAllPost: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPostLiked = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found" });

    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({ path: "User", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    res.status(200).json(likedPosts);
  } catch (error) {
    console.error(`Error from getPostLiked: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFollowingPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found" });

    const following = user.following;

    const postFeed = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(postFeed);
  } catch (error) {
    console.error(`Error from getFollowingPost: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(userPosts);
  } catch (error) {
    console.error(`Error from getUserPosts: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
