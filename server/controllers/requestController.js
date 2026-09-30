const Request = require('../models/Request');

// POST /api/requests (Day 6)
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId, skillToLearn, message } = req.body;
    if (!receiverId || !skillToLearn) {
      return res.status(400).json({ success: false, message: 'Receiver ID and skill are required' });
    }

    const request = await Request.create({
      sender: req.user.id,
      receiver: receiverId,
      skillToLearn,
      message: message || ''
    });

    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/requests/:id/status (Day 7)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
    }

    const request = await Request.findOne({ _id: req.params.id, receiver: req.user.id });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or not authorized' });
    }

    request.status = status;
    await request.save();

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/requests (Day 8)
exports.getMyRequests = async (req, res) => {
  try {
    const incoming = await Request.find({ receiver: req.user.id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 });

    const outgoing = await Request.find({ sender: req.user.id })
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, incoming, outgoing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};