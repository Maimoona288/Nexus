// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['investor', 'entrepreneur'], required: true },
//   bio: { type: String, default: '' },
//   // Extended Profile Storage based on role
//   investorDetails: {
//     investmentHistory: { type: Array, default: [] },
//     preferences: { type: Array, default: [] }
//   },
//   entrepreneurDetails: {
//     startupName: { type: String, default: '' },
//     startupHistory: { type: Array, default: [] },
//     preferences: { type: Array, default: [] }
//   }
// }, { timestamps: true });

// // Pre-save validation checkpoint to ensure accurate profile shapes
// UserSchema.pre('save', function (next) {
//   if (this.role === 'investor' && !this.investorDetails) {
//     this.investorDetails = { investmentHistory: [], preferences: [] };
//   }
//   if (this.role === 'entrepreneur' && !this.entrepreneurDetails) {
//     this.entrepreneurDetails = { startupName: '', startupHistory: [], preferences: [] };
//   }
//   next();
// });

// module.exports = mongoose.model('User', UserSchema);

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
  }
}, {
  timestamps: true
});

// Clean, Promise-based Pre-Save Hook (No 'next' callback parameter needed)
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