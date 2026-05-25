const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Meeting = require('../models/meetingModel');
const Document = require('../models/documentModel');
const { verifyToken } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// ─── Meetings ───────────────────────────────────────────────────────────────
router.post('/meetings', verifyToken, async (req, res) => {
  try {
    const { title, description, attendee, startTime, endTime } = req.body;
    const host = req.user.id;

    if (!title || !attendee || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required parameters.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const conflict = await Meeting.findOne({
      status: { $ne: 'rejected' },
      $or: [
        { host }, { host: attendee }, { attendee: host }, { attendee }
      ],
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Schedule conflict detected. One participant is busy.' });
    }

    const roomId = `room-${Math.random().toString(36).substring(2, 11)}`;
    const meeting = await Meeting.create({ title, description, host, attendee, startTime: start, endTime: end, roomId });
    res.status(201).json({ message: 'Meeting scheduled.', meeting });
  } catch (err) {
    res.status(500).json({ message: 'Meeting booking failure.', error: err.message });
  }
});

router.get('/meetings', verifyToken, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user.id }, { attendee: req.user.id }]
    }).populate('host attendee', 'name email role');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving meetings.', error: err.message });
  }
});

router.patch('/meetings/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' });
    res.json({ message: `Meeting ${status}.`, meeting });
  } catch (err) {
    res.status(500).json({ message: 'Error updating meeting.', error: err.message });
  }
});

// ─── Documents ──────────────────────────────────────────────────────────────
router.post('/documents', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const doc = await Document.create({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id
    });
    res.status(201).json({ message: 'Document uploaded.', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Upload error.', error: err.message });
  }
});

router.get('/documents', verifyToken, async (req, res) => {
  try {
    const docs = await Document.find({ uploadedBy: req.user.id })
      .populate('uploadedBy', 'name email');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching documents.', error: err.message });
  }
});

router.patch('/documents/:id/sign', verifyToken, async (req, res) => {
  try {
    const { signatureImage } = req.body;
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { signatureImage, status: 'signed' },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Document not found.' });
    res.json({ message: 'Document signed.', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Error signing document.', error: err.message });
  }
});

module.exports = router;
