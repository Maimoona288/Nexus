// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const authRoutes = require('./routes/auth');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);

// // Database Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ Connected safely to MongoDB.'))
//   .catch((err) => console.error('❌ Database connection error:', err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Security/Auth Server running smoothly on port ${PORT}`);
// });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected safely to MongoDB.');
    // Run seed after database connection succeeds
    seedDemoAccounts();
  })
  .catch((err) => console.error('❌ Database connection error:', err));

// Seeding Function
const seedDemoAccounts = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    const demoUsers = [
      { name: 'Sarah Jenkins', email: 'sarah@techwave.io', password: 'password123', role: 'entrepreneur' },
      { name: 'Michael Chang', email: 'michael@vcinnovate.com', password: 'password123', role: 'investor' }
    ];

    for (let u of demoUsers) {
      const exist = await User.findOne({ email: u.email });
      if (!exist) {
        const salt = await bcrypt.genSalt(10);
        u.password = await bcrypt.hash(u.password, salt);
        await new User(u).save();
        console.log(`🌱 Seeded Demo Account Node: ${u.email}`);
      }
    }
  } catch (err) {
    console.error("Demo account creation loop bypassed:", err);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Security/Auth Server running smoothly on port ${PORT}`);
});