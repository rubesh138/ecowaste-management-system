const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      enum: [
        'Missed Collection',
        'Improper Collection',
        'Waste Overflow',
        'Damaged Bin',
        'Illegal Dumping',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide the incident address'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    adminResponse: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
