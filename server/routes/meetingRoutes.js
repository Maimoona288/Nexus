const express = require('express');
const router = express.Router();
const Meeting = require('../models/meetingModel');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Meeting scheduling and management
 */

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Schedule a new meeting
 *     tags: [Meetings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, attendee, startTime, endTime]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               attendee: { type: string }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *     responses:
 *       201: { description: Meeting scheduled }
 *       400: { description: Conflict or missing fields }
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, attendee, startTime, endTime } = req.body;
    const host = req.user.id;

    if (!title || !attendee || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }

    // Conflict detection
    const conflict = await Meeting.findOne({
      status: { $ne: 'rejected' },
      $or: [
        { host: host }, { attendee: host },
        { host: attendee }, { attendee: attendee }
      ],
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Schedule conflict: A participant is already booked at this time.' });
    }

    const roomId = `nexus-room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const meeting = await Meeting.create({
      title, description, host, attendee,
      startTime: start, endTime: end, roomId
    });

    const populated = await Meeting.findById(meeting._id)
      .populate('host attendee', 'name email role avatarUrl');

    res.status(201).json({ message: 'Meeting scheduled.', meeting: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: Get all meetings for current user
 *     tags: [Meetings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: List of meetings }
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user.id }, { attendee: req.user.id }]
    })
      .populate('host attendee', 'name email role avatarUrl')
      .sort({ startTime: 1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meetings.', error: err.message });
  }
});

/**
 * @swagger
 * /api/meetings/{id}/status:
 *   patch:
 *     summary: Accept or reject a meeting
 *     tags: [Meetings]
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
 *               status: { type: string, enum: [accepted, rejected] }
 *     responses:
 *       200: { description: Status updated }
 *       403: { description: Not the attendee }
 *       404: { description: Meeting not found }
 */
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected.' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' });

    if (meeting.attendee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the attendee can update status.' });
    }

    meeting.status = status;
    await meeting.save();

    const populated = await Meeting.findById(meeting._id)
      .populate('host attendee', 'name email role avatarUrl');

    res.json({ message: `Meeting ${status}.`, meeting: populated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating meeting.', error: err.message });
  }
});

/**
 * @swagger
 * /api/meetings/{id}:
 *   delete:
 *     summary: Cancel / delete a meeting
 *     tags: [Meetings]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' });
    if (meeting.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the host can cancel this meeting.' });
    }
    await meeting.deleteOne();
    res.json({ message: 'Meeting cancelled.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting meeting.', error: err.message });
  }
});

module.exports = router;
