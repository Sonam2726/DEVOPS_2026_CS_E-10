const User = require("../models/User");
const Skill = require("../models/Skill");
const Request = require("../models/Request");
const Session = require("../models/Session");
const Notification = require("../models/Notification");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "name email bio location profileImage role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [
      totalSkills,
      sentRequests,
      receivedRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      mentorSessions,
      learnerSessions,
      upcomingSessions,
      completedSessions,
      cancelledSessions,
      totalNotifications,
      unreadNotifications,
      recentNotifications,
    ] = await Promise.all([
      Skill.countDocuments({
        owner: userId,
      }),

      Request.countDocuments({
        sender: userId,
      }),

      Request.countDocuments({
        receiver: userId,
      }),

      Request.countDocuments({
        $or: [
          { sender: userId },
          { receiver: userId },
        ],
        status: "pending",
      }),

      Request.countDocuments({
        $or: [
          { sender: userId },
          { receiver: userId },
        ],
        status: "accepted",
      }),

      Request.countDocuments({
        $or: [
          { sender: userId },
          { receiver: userId },
        ],
        status: "rejected",
      }),

      Session.countDocuments({
        mentor: userId,
      }),

      Session.countDocuments({
        learner: userId,
      }),

      Session.countDocuments({
        $or: [
          { mentor: userId },
          { learner: userId },
        ],
        status: "upcoming",
      }),

      Session.countDocuments({
        $or: [
          { mentor: userId },
          { learner: userId },
        ],
        status: "completed",
      }),

      Session.countDocuments({
        $or: [
          { mentor: userId },
          { learner: userId },
        ],
        status: "cancelled",
      }),

      Notification.countDocuments({
        user: userId,
      }),

      Notification.countDocuments({
        user: userId,
        isRead: false,
      }),

      Notification.find({
        user: userId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("type title message isRead createdAt"),
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          location: user.location,
          profileImage: user.profileImage,
          role: user.role,
        },

        statistics: {
          totalSkills,

          requests: {
            sent: sentRequests,
            received: receivedRequests,
            pending: pendingRequests,
            accepted: acceptedRequests,
            rejected: rejectedRequests,
          },

          sessions: {
            mentor: mentorSessions,
            learner: learnerSessions,
            upcoming: upcomingSessions,
            completed: completedSessions,
            cancelled: cancelledSessions,
          },

          notifications: {
            total: totalNotifications,
            unread: unreadNotifications,
          },
        },

        recentActivity: recentNotifications,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

module.exports = {
  getDashboard,
};