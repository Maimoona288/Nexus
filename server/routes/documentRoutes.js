const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/documentModel');
const { verifyToken } = require('../middleware/authMiddleware');

// Multer storage config
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('File type not allowed.'));
  }
});

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document upload and management chamber
 */

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               title: { type: string }
 *     responses:
 *       201: { description: Document uploaded }
 */
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const doc = await Document.create({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id
    });

    const populated = await Document.findById(doc._id)
      .populate('uploadedBy', 'name email role');

    res.status(201).json({ message: 'Document uploaded.', document: populated });
  } catch (err) {
    res.status(500).json({ message: 'Upload error.', error: err.message });
  }
});

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents for current user
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const docs = await Document.find({ uploadedBy: req.user.id })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching documents.', error: err.message });
  }
});

/**
 * @swagger
 * /api/documents/{id}/sign:
 *   patch:
 *     summary: Add e-signature to document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signatureImage: { type: string, description: Base64 signature image }
 *     responses:
 *       200: { description: Document signed }
 */
router.patch('/:id/sign', verifyToken, async (req, res) => {
  try {
    const { signatureImage } = req.body;
    if (!signatureImage) return res.status(400).json({ message: 'Signature image required.' });

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found.' });
    if (doc.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    doc.signatureImage = signatureImage;
    doc.status = 'signed';
    await doc.save();

    res.json({ message: 'Document signed.', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Error signing document.', error: err.message });
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found.' });
    if (doc.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', doc.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await doc.deleteOne();
    res.json({ message: 'Document deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting document.', error: err.message });
  }
});

/**
 * @swagger
 * /api/documents/{id}/status:
 *   patch:
 *     summary: Update document status
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 */
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'signed', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const doc = await Document.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Document not found.' });
    res.json({ message: 'Status updated.', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status.', error: err.message });
  }
});

module.exports = router;
