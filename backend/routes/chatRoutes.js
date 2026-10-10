const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const WasteRequest = require('../models/WasteRequest');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const question = message.toLowerCase().trim();

    // ==========================================
    // MY REQUESTS
    // ==========================================

    if (
      question === 'request' ||
      question === 'requests' ||
      question === 'my request' ||
      question === 'my requests' ||
      question.includes('show my request') ||
      question.includes('show my requests') ||
      question.includes('request status') ||
      question.includes('my pickup')
    ) {
      const requests = await WasteRequest.find({
        citizen: req.user._id,
      })
        .sort({ createdAt: -1 })
        .lean();

      if (!requests.length) {
        return res.json({
          success: true,
          type: 'text',
          reply: "You don't have any waste collection requests yet.",
        });
      }

      return res.json({
        success: true,
        type: 'requests',
        title: 'My Waste Requests',
        message: `I found ${requests.length} request${
          requests.length > 1 ? 's' : ''
        } for your account.`,
        requests: requests.map((request) => ({
          id: request._id,
          requestId: request.requestId,
          wasteType: request.wasteType,
          quantity: request.quantity,
          preferredDate: request.preferredDate,
          scheduledDate: request.scheduledDate,
          address: request.address,
          description: request.description,
          status: request.status,
          adminResponse: request.adminResponse,
          rejectionReason: request.rejectionReason,
          createdAt: request.createdAt,
        })),
      });
    }

    // ==========================================
    // MY COMPLAINTS
    // ==========================================

    if (
      question === 'complaint' ||
      question === 'complaints' ||
      question === 'my complaint' ||
      question === 'my complaints' ||
      question.includes('show my complaint') ||
      question.includes('show my complaints') ||
      question.includes('my complaint status') ||
      question.includes('my complaint history')
    ) {
      const complaints = await Complaint.find({
        citizen: req.user._id,
      })
        .sort({ createdAt: -1 })
        .lean();

      if (!complaints.length) {
        return res.json({
          success: true,
          type: 'text',
          reply: "You don't have any complaints yet.",
        });
      }

      return res.json({
        success: true,
        type: 'complaints',
        title: 'My Complaints',
        message: `I found ${complaints.length} complaint${
          complaints.length > 1 ? 's' : ''
        } for your account.`,
        complaints: complaints.map((complaint) => ({
          id: complaint._id,
          complaintId: complaint.complaintId,
          category: complaint.category,
          description: complaint.description,
          address: complaint.address,
          status: complaint.status,
          adminResponse: complaint.adminResponse,
          createdAt: complaint.createdAt,
        })),
      });
    }

    // ==========================================
    // MY NOTIFICATIONS
    // ==========================================

    if (
      question === 'notification' ||
      question === 'notifications' ||
      question === 'my notification' ||
      question === 'my notifications' ||
      question.includes('show my notification') ||
      question.includes('show my notifications') ||
      question.includes('notification history')
    ) {
      const notifications = await Notification.find({
        recipient: req.user._id,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      if (!notifications.length) {
        return res.json({
          success: true,
          type: 'text',
          reply: "You don't have any notifications yet.",
        });
      }

      return res.json({
        success: true,
        type: 'notifications',
        title: 'My Notifications',
        message: `Here are your latest ${notifications.length} notifications.`,
        notifications: notifications.map((notification) => ({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        })),
      });
    }

    // ==========================================
    // MY PROFILE
    // ==========================================

    if (
      question === 'profile' ||
      question === 'my profile' ||
      question === 'show my profile' ||
      question === 'my account' ||
      question === 'account details'
    ) {
      return res.json({
        success: true,
        type: 'profile',
        title: 'My Profile',
        profile: {
          name: req.user.name || '',
          email: req.user.email || '',
          phone: req.user.phone || '',
          address: req.user.address || '',
          role: req.user.role || 'citizen',
        },
      });
    }

    // ==========================================
    // RECYCLING GUIDE
    // ==========================================

    if (
      question === 'recycling' ||
      question === 'recycle' ||
      question === 'recycling guide' ||
      question.includes('recycling guide') ||
      question.includes('how to recycle') ||
      question.includes('what can i recycle') ||
      question.includes('waste segregation')
    ) {
      return res.json({
        success: true,
        type: 'recycling',
        title: 'EcoWaste Recycling Guide',

        categories: [
          {
            name: '♻️ Plastic',
            items: 'Plastic bottles, containers and packaging',
            tip: 'Rinse plastic containers and keep them dry before recycling.',
          },
          {
            name: '📦 Paper & Cardboard',
            items: 'Newspapers, cardboard boxes and paper',
            tip: 'Keep paper and cardboard clean and dry.',
          },
          {
            name: '🔌 E-Waste',
            items: 'Old phones, chargers, electronics and batteries',
            tip: 'Never mix e-waste with normal household waste.',
          },
          {
            name: '🍾 Glass',
            items: 'Glass bottles and jars',
            tip: 'Separate glass carefully and avoid mixing broken glass.',
          },
          {
            name: '🥫 Metal',
            items: 'Aluminium cans and metal containers',
            tip: 'Clean metal containers before recycling.',
          },
          {
            name: '🍃 Organic Waste',
            items: 'Food scraps, vegetable waste and garden waste',
            tip: 'Keep organic waste separate for composting.',
          },
        ],

        tip:
          'Always segregate waste at the source. Keep recyclable materials clean and dry for better recycling.',
      });
    }

    // ==========================================
    // GREETING
    // ==========================================

    if (
      question === 'hi' ||
      question === 'hello' ||
      question === 'hey'
    ) {
      return res.json({
        success: true,
        type: 'text',
        reply: 'Hello! 👋 How can I help you with EcoWaste today?',
      });
    }

    // ==========================================
    // CREATE REQUEST HELP
    // ==========================================

    if (
      question.includes('create') &&
      (question.includes('request') ||
        question.includes('collection'))
    ) {
      return res.json({
        success: true,
        type: 'text',
        reply:
          'You can create a waste collection request from the Create Request section. Select your waste type, quantity, preferred pickup date and address, then submit the request.',
      });
    }

    // ==========================================
    // SUBMIT COMPLAINT HELP
    // ==========================================

    if (
      question.includes('file a complaint') ||
      question.includes('submit a complaint') ||
      question.includes('how to complaint')
    ) {
      return res.json({
        success: true,
        type: 'text',
        reply:
          'You can submit a complaint from the Complaints section. After submitting it, you can track its status there.',
      });
    }

    // ==========================================
    // DEFAULT
    // ==========================================

    return res.json({
      success: true,
      type: 'text',
      reply:
        'I can help you with your requests, complaints, notifications, profile and recycling guide. Try "my requests", "my complaints", "notifications", "profile" or "recycling guide".',
    });

  } catch (error) {
    console.error('Chatbot error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong with the chatbot.',
    });
  }
});

module.exports = router;