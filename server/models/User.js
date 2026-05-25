const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['entrepreneur', 'investor'],
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  investorDetails: {
    companyName: String,
    investmentBudget: String,
    preferredIndustries: [String]
  },
  entrepreneurDetails: {
    startupName: String,
    industry: String,
    fundingStage: String
  },
  // Secure tokens used during the account password recovery pipeline
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Clean, Promise-based Pre-Save Hook
UserSchema.pre('save', async function() {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (err) {
    throw new Error('Password hashing lifecycle failed: ' + err.message);
  }
});

module.exports = mongoose.model('User', UserSchema);