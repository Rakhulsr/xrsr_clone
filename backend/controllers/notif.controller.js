import Notification from "../models/notif.model.js";

export const getNotif = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifs = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifs);
  } catch (error) {
    console.error("error in getNotif", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotif = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "success delete notif" });
  } catch (error) {
    console.error("error in deleteNotif", error.message);
    res.status(500).json({ error: error.message });
  }
};
