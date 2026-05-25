
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto'); // Built-in Node module for secure token generation
// const sendEmail = require('../utils/sendEmail'); // Imported clean email utility module

// // 1. User Registration Handler
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ message: 'Missing required initialization parameters.' });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'Email address already registered inside Nexus.' });
//     }

//     const newUser = new User({
//       name,
//       email,
//       password, 
//       role,
//       bio: '',
//       avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
//       isOnline: true
//     });

//     await newUser.save();

//     const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     res.status(201).json({
//       token,
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Backend engine failure during registration pipeline.', error: err.message });
//   }
// };

// // 2. User Login Handler
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required fields.' });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials or account non-existent.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid secret password assignment code.' });
//     }

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server database read loop processing error.', error: err.message });
//   }
// };

// // 3. Fetch/Get Current User Profile
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: 'Profile data not found.' });
//     }
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
    
//     if (req.user.role === 'investor' && investorDetails) {
//       updateFields.investorDetails = investorDetails;
//     }
//     if (req.user.role === 'entrepreneur' && entrepreneurDetails) {
//       updateFields.entrepreneurDetails = entrepreneurDetails;
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       { $set: updateFields },
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'Target profile account not found.' });
//     }

//     res.json({ message: 'Profile updated successfully.', user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ message: 'Required improvements processing error during update.', error: err.message });
//   }
// };

// // 5. Initiates Token Generation, Storage & Clean Email Helper Dispatch
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ message: 'Email address is required.' });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       // Security Practice: Prevent account enumeration attacks
//       console.log(`🔍 Password recovery targeted non-existent email account: ${email}`);
//       return res.json({ message: 'If that email exists, a reset link has been dispatched.' });
//     }

//     // 1. Create a secure 20-byte random hex token
//     const resetToken = crypto.randomBytes(20).toString('hex');
    
//     // 2. Store token and expiration window (1 hour)
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 3600000; 
//     await user.save();

//     // 3. Build the reset URL pointing directly to your Vite frontend client path
//     const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

//     // 4. Dispatch the automated email utilizing your clean helper utility setup
//     try {
//       await sendEmail({
//         email: user.email,
//         subject: 'Business Nexus - Account Security Password Recovery',
//         message: `Please complete your account password configuration setup by navigating to this location: ${resetUrl}`, // Plain-text fallback
//         resetUrl: resetUrl // Injected directly into your custom HTML layout template button
//       });

//       console.log(`✉️ Live recovery email dispatched securely via sendEmail.js utility to: ${user.email}`);
//       return res.json({ message: 'If that email exists, a reset link has been dispatched.' });

//     } catch (mailError) {
//       // If the mailing pipeline breaks, clear the token states so the user isn't corrupted in DB
//       user.resetPasswordToken = undefined;
//       user.resetPasswordExpires = undefined;
//       await user.save();

//       console.error("❌ Email Delivery Engine Failure:", mailError);
//       return res.status(500).json({ message: 'Failed to dispatch password recovery email transmission.', error: mailError.message });
//     }

//   } catch (err) {
//     res.status(500).json({ message: 'Error processing forgot password request.', error: err.message });
//   }
// };

// // 6. Confirms and Updates Account Password
// exports.resetPassword = async (req, res) => {
//   try {
//     // Extract parameters directly from req.body to align seamlessly with frontend schema layouts
// const { token } = req.params;
// const { password } = req.body;

//     if (!token || !password) {
//       return res.status(400).json({ message: 'Verification token and new password parameters are required.' });
//     }

//     // Locate active user matching token where expiration timestamp is still in the future
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() } 
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
//     }

//     // Update password fields (pre-save hashing hooks inside your User model execute automatically)
//     user.password = password;
//     user.resetPasswordToken = null;
//     user.resetPasswordExpires = null;

//     await user.save();

//     res.json({ message: 'Password updated successfully. You can now log in.' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error re-setting account password credentials.', error: err.message });
//   }
// };

give me copy paste code ok here is 
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module for secure token generation
const sendEmail = require('../utils/sendEmail'); // Imported clean email utility module

// 1. User Registration Handler
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required initialization parameters.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email address already registered inside Nexus.' });
    }

    const newUser = new User({
      name,
      email,
      password, 
      role,
      bio: '',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      isOnline: true
    });

    await newUser.save();

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
    res.status(500).json({ message: 'Server database read loop processing error.', error: err.message });
  }
};

// 3. Fetch/Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Profile data not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving profile.', error: err.message });
  }
};

// 4. Update Current User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, investorDetails, entrepreneurDetails } = req.body;
    const updateFields = {};

    if (bio !== undefined) updateFields.bio = bio;
    
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
    res.status(500).json({ message: 'Required improvements processing error during update.', error: err.message });
  }
};

// 5. Initiates Token Generation, Storage & Clean Email Helper Dispatch
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security Practice: Prevent account enumeration attacks
      console.log(`🔍 Password recovery targeted non-existent email account: ${email}`);
      return res.json({ message: 'If that email exists, a reset link has been dispatched.' });
    }

    // 1. Create a secure 20-byte random hex token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // 2. Store token and expiration window (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    // 3. Build the reset URL pointing directly to your Vite frontend client path
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    // 4. Dispatch the automated email utilizing your clean helper utility setup
    try {
      await sendEmail({
        email: user.email,
        subject: 'Business Nexus - Account Security Password Recovery',
        message: `Please complete your account password configuration setup by navigating to this location: ${resetUrl}`, // Plain-text fallback
        resetUrl: resetUrl // Injected directly into your custom HTML layout template button
      });

      console.log(`✉️ Live recovery email dispatched securely via sendEmail.js utility to: ${user.email}`);
      return res.json({ message: 'If that email exists, a reset link has been dispatched.' });

    } catch (mailError) {
      // If the mailing pipeline breaks, clear the token states so the user isn't corrupted in DB
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error("❌ Email Delivery Engine Failure:", mailError);
      return res.status(500).json({ message: 'Failed to dispatch password recovery email transmission.', error: mailError.message });
    }

  } catch (err) {
    res.status(500).json({ message: 'Error processing forgot password request.', error: err.message });
  }
};

// 6. Confirms and Updates Account Password
exports.resetPassword = async (req, res) => {
  try {
    // Extract parameters directly from req.body to align seamlessly with frontend schema layouts
const { token } = req.params;
const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Verification token and new password parameters are required.' });
    }

    // Locate active user matching token where expiration timestamp is still in the future
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Update password fields (pre-save hashing hooks inside your User model execute automatically)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Error re-setting account password credentials.', error: err.message });
  }
};

give me copy paste code ok here is 
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module for secure token generation
const sendEmail = require('../utils/sendEmail'); // Imported clean email utility module

// 1. User Registration Handler
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required initialization parameters.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email address already registered inside Nexus.' });
    }

    const newUser = new User({
      name,
      email,
      password, 
      role,
      bio: '',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      isOnline: true
    });

    await newUser.save();

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
    res.status(500).json({ message: 'Server database read loop processing error.', error: err.message });
  }
};

// 3. Fetch/Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Profile data not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving profile.', error: err.message });
  }
};

// 4. Update Current User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, investorDetails, entrepreneurDetails } = req.body;
    const updateFields = {};

    if (bio !== undefined) updateFields.bio = bio;
    
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
    res.status(500).json({ message: 'Required improvements processing error during update.', error: err.message });
  }
};

// 5. Initiates Token Generation, Storage & Clean Email Helper Dispatch
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security Practice: Prevent account enumeration attacks
      console.log(`🔍 Password recovery targeted non-existent email account: ${email}`);
      return res.json({ message: 'If that email exists, a reset link has been dispatched.' });
    }

    // 1. Create a secure 20-byte random hex token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // 2. Store token and expiration window (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    // 3. Build the reset URL pointing directly to your Vite frontend client path
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    // 4. Dispatch the automated email utilizing your clean helper utility setup
    try {
      await sendEmail({
        email: user.email,
        subject: 'Business Nexus - Account Security Password Recovery',
        message: `Please complete your account password configuration setup by navigating to this location: ${resetUrl}`, // Plain-text fallback
        resetUrl: resetUrl // Injected directly into your custom HTML layout template button
      });

      console.log(`✉️ Live recovery email dispatched securely via sendEmail.js utility to: ${user.email}`);
      return res.json({ message: 'If that email exists, a reset link has been dispatched.' });

    } catch (mailError) {
      // If the mailing pipeline breaks, clear the token states so the user isn't corrupted in DB
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error("❌ Email Delivery Engine Failure:", mailError);
      return res.status(500).json({ message: 'Failed to dispatch password recovery email transmission.', error: mailError.message });
    }

  } catch (err) {
    res.status(500).json({ message: 'Error processing forgot password request.', error: err.message });
  }
};

// 6. Confirms and Updates Account Password
exports.resetPassword = async (req, res) => {
  try {
    // Extract parameters directly from req.body to align seamlessly with frontend schema layouts
const { token } = req.params;
const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Verification token and new password parameters are required.' });
    }

    // Locate active user matching token where expiration timestamp is still in the future
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Update password fields (pre-save hashing hooks inside your User model execute automatically)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Error re-setting account password credentials.', error: err.message });
  }
};