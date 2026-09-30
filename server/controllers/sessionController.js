const Session = require('../models/Session');

// Create session (Day 9)
exports.createSession = async (req, res) => {
  try {
    const { learnerId, skill, scheduledAt, durationMinutes, meetingLink, notes } = req.body;
    
    if (!learnerId || !skill || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'Learner, skill, and scheduled time are required' });
    }

    const session = await Session.create({
      mentor: req.user.id,
      learner: learnerId,
      skill,
      scheduledAt,
      durationMinutes: durationMinutes || 60,
      meetingLink: meetingLink || '',
      notes: notes || ''
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get upcoming and completed sessions (Day 10)
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ mentor: req.user.id }, { learner: req.user.id }]
    })
      .populate('mentor', 'name email avatar')
      .populate('learner', 'name email avatar')
      .sort({ scheduledAt: 1 });

    res.json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update or Cancel session (Day 11)
exports.updateSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      $or: [{ mentor: req.user.id }, { learner: req.user.id }]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, session: updatedSession });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};