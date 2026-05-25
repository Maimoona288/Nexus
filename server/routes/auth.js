// const express = require('express');
// const router = express.Router();
// const { register, login, getProfile, updateProfile } = require('../controllers/authController');
// const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// // Public Access Route Definitions
// router.post('/register', register);
// router.post('/login', login);

// // Secure Identity Profile Access Paths
// router.get('/profile', verifyToken, getProfile);
// router.put('/profile', verifyToken, updateProfile);

// // Example Dashboard Protection System (Role Testing)
// router.get('/investor-dashboard', verifyToken, authorizeRoles('investor'), (req, res) => {
//   res.json({ msg: "Welcome to the premium Investor Dashboard hub." });
// });

// router.get('/entrepreneur-dashboard', verifyToken, authorizeRoles('entrepreneur'), (req, res) => {
//   res.json({ msg: "Welcome to your Entrepreneur Dashboard hub." });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public Access Route Definitions
router.post('/register', register);
router.post('/login', login);

// Secure Identity Profile Access Paths
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Dashboard Protection Systems (Role Authorization Routing)
router.get('/investor-dashboard', verifyToken, authorizeRoles('investor'), (req, res) => {
  res.json({ msg: "Welcome to the premium Investor Dashboard hub." });
});

router.get('/entrepreneur-dashboard', verifyToken, authorizeRoles('entrepreneur'), (req, res) => {
  res.json({ msg: "Welcome to your Entrepreneur Dashboard hub." });
});

module.exports = router;