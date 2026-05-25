const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  filename: { 
    type: String, 
    required: true 
  },
  filePath: { 
    type: String, 
    required: true 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  version: { 
    type: Number, 
    default: 1 
  },
  status: { 
    type: String, 
    enum: ['pending', 'signed', 'archived'], 
    default: 'pending' 
  },
  signatureImage: { 
    type: String // Stores the Base64 graphical signature image string
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);