const mongoose = require('mongoose');

const recyclingRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      unique: true,
      required: true,
    },
    wasteType: {
      type: String,
      required: [true, 'Please specify waste type'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity in kg'],
      min: 0.1,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    method: {
      type: String,
      required: [true, 'Please specify recycling or processing method'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Received', 'Processing', 'Recycled', 'Rejected'],
      default: 'Received',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RecyclingRecord', recyclingRecordSchema);
