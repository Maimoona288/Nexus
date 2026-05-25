// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // 1. User Registration
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     let userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: 'User already exists.' });

//     // Hashing password securely
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role
//     });

//     await user.save();

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     res.status(500).json({ message: 'Server registration error.', error: err.message });
//   }
// };

// // 2. User Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     res.status(500).json({ message: 'Server login error.', error: err.message });
//   }
// };

// // 3. Fetch/Get Current User Profile
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     if (!user) return res.status(404).json({ message: 'Profile data not found.' });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: 'Error retrieving profile.', error: err.message });
//   }
// };

// // 4. Update Current User Profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const { bio, investorDetails, entrepreneurDetails } = req.body;
//     const updateFields = {};

//     if (bio !== undefined) updateFields.bio = bio;
//     if (req.user.role === 'investor' && investorDetails) updateFields.investorDetails = investorDetails;
//     if (req.user.role === 'entrepreneur' && entrepreneurDetails) updateFields.entrepreneurDetails = entrepreneurDetails;

//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       { $set: updateFields },
//       { new: true, runValidators: true }
//     ).select('-password');

//     res.json({ message: 'Profile updated successfully.', user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating profile.', error: err.message });
//   }
// };

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. User Registration Handler
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Explicit Payload Verification
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required initialization parameters.' });
    }

    // Prevent duplicate accounts from throwing system errors
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email address already registered inside Nexus.' });
    }

    // REMOVED: Manual hashing block here. 
    // The pre-save hook in models/User.js handles hashing seamlessly upon calling .save()

    const newUser = new User({
      name,
      email,
      password, // Pass plaintext directly; model pre-save hook secures it safely
      role,
      bio: '',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      isOnline: true
    });

    await newUser.save();

    // Issue standard validation token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("❌ Register Error Trace Log:", err);
    res.status(500).json({ message: 'Backend engine failure during registration pipeline.', error: err.message });
  }
};

// 2. User Login Handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials or account non-existent.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid secret password assignment code.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("❌ Login Error Trace Log:", err);
    res.status(500).json({ message: 'Server database read loop processing error.', error: err.message });
  }
};

// 3. Fetch/Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    // req.user.id is attached by verifyToken middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Profile data not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Get Profile Error Trace Log:", err);
    res.status(500).json({ message: 'Error retrieving profile.', error: err.message });
  }
};

// 4. Update Current User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, investorDetails, entrepreneurDetails } = req.body;
    const updateFields = {};

    if (bio !== undefined) updateFields.bio = bio;
    
    // Role-enforced criteria matching
    if (req.user.role === 'investor' && investorDetails) {
      updateFields.investorDetails = investorDetails;
    }
    if (req.user.role === 'entrepreneur' && entrepreneurDetails) {
      updateFields.entrepreneurDetails = entrepreneurDetails;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Target profile account not found.' });
    }

    res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (err) {
    console.error("❌ Update Profile Error Trace Log:", err);
    res.status(500).json({ message: 'Required improvements processing error during update.', error: err.message });
  }
};