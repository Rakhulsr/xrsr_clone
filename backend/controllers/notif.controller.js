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

export const deleteOneNotif = async (req, res) => {
  try {
    const notifId = req.params.id;

    const userId = req.user._id;

    const notification = await Notification.findById(notifId);

    if (!notification) {
      res.status(404).json({ message: "Notif Not Found" });
    }

    if (notification.to.toString() != userId.toString()) {
      return res
        .status(403)
        .json({ message: "you not have permissioan to delete notif" });
    }

    await Notification.findByIdAndDelete(notifId);
    res.status(200).json({ message: "Notif Deleted" });
  } catch (error) {
    console.error("error in deleteOneNotif", error.message);
    res.status(500).json({ error: error.message });
  }
};
