const mongoose = require('mongoose');

const wasteRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      required: true,
    },

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Employee assigned by Admin
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    wasteType: {
      type: String,
      required: [true, 'Please select a waste category'],
      trim: true,
    },

    quantity: {
      type: String,
      required: [true, 'Please provide quantity'],
      trim: true,
    },

    quantityValue: {
      type: Number,
      default: 5,
    },

    unit: {
      type: String,
      default: 'kg',
    },

    preferredDate: {
      type: Date,
      required: [true, 'Please provide preferred collection date'],
    },

    scheduledDate: {
      type: Date,
    },

    address: {
      type: String,
      required: [true, 'Please provide collection address'],
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    image: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Under Review',
        'Accepted',
        'Scheduled',
        'Collected',
        'Completed',
        'Rejected',
      ],
      default: 'Pending',
    },

    adminResponse: {
      type: String,
      default: '',
    },

    rejectionReason: {
      type: String,
      default: '',
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WasteRequest', wasteRequestSchema);