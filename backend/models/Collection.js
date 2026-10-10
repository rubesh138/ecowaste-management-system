const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    // Original citizen request that created this collection
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteRequest',
      default: null,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    collectionType: {
      type: String,
      enum: ['house', 'industry', 'village'],
      required: true,
    },

    locationName: {
      type: String,
      required: true,
      trim: true,
    },

    wasteType: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    collected: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Collection', collectionSchema);