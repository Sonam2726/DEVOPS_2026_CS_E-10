const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillToLearn: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Indexes for faster request queries
requestSchema.index({ receiver: 1, createdAt: -1 });
requestSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);