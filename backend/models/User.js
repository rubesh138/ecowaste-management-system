const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: ['citizen', 'admin', 'employee'],
      default: 'citizen',
    },

    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters'],
      validate: {
        validator: function (value) {
          return /[A-Za-z]/.test(value);
        },
        message:
          'Please provide a valid address containing letters',
      },
    },

    // =====================================================
    // PROFILE PHOTO
    // =====================================================

    profilePhoto: {
      type: String,
      default: '',
      trim: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// ENCRYPT PASSWORD BEFORE SAVING
// =====================================================

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});

// =====================================================
// MATCH PASSWORD
// =====================================================

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

module.exports = mongoose.model(
  'User',
  userSchema
);