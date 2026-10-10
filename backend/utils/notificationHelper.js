const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send notification to a specific user
 */
const notifyUser = async ({ recipient, title, message, type = 'system', relatedRequest = null, relatedComplaint = null }) => {
  try {
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedRequest,
      relatedComplaint,
    });
  } catch (error) {
    console.error('Error creating user notification:', error);
  }
};

/**
 * Send notification to all active admins
 */
const notifyAdmins = async ({ title, message, type = 'system', relatedRequest = null, relatedComplaint = null }) => {
  try {
    const admins = await User.find({ role: 'admin', status: 'active' });
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title,
      message,
      type,
      relatedRequest,
      relatedComplaint,
    }));

    if (notifications.length > 0) {
      return await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error creating admin notifications:', error);
  }
};

module.exports = {
  notifyUser,
  notifyAdmins,
};
