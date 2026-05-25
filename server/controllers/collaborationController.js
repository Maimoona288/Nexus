
// const Meeting = require('../models/meetingModel');
// const Document = require('../models/documentModel');

// // 📅 MEETING SCHEDULING SYSTEM
// exports.scheduleMeeting = async (req, res) => {
//   try {
//     const { title, description, attendee, startTime, endTime } = req.body;
//     const host = req.user.id; 

//     if (!title || !attendee || !startTime || !endTime) {
//       return res.status(400).json({ message: 'Missing required parameters.' });
//     }

//     const start = new Date(startTime);
//     const end = new Date(endTime);

//     const conflict = await Meeting.findOne({
//       status: { $ne: 'rejected' },
//       $or: [
//         { host: host }, { host: attendee },
//         { attendee: host }, { attendee: attendee }
//       ],
//       startTime: { $lt: end },
//       endTime: { $gt: start }
//     });

//     if (conflict) {
//       return res.status(400).json({ message: 'Schedule conflict detected. One participant is busy.' });
//     }

//     const roomId = `room-${Math.random().toString(36).substring(2, 11)}`;
//     const newMeeting = new Meeting({ title, description, host, attendee, startTime: start, endTime: end, roomId });
//     await newMeeting.save();

//     res.status(201).json({ message: 'Meeting scheduled successfully.', meeting: newMeeting });
//   } catch (err) {
//     res.status(500).json({ message: 'Meeting booking failure.', error: err.message });
//   }
// };

// exports.getMeetings = async (req, res) => {
//   try {
//     const meetings = await Meeting.find({
//       $or: [{ host: req.user.id }, { attendee: req.user.id }]
//     }).populate('host attendee', 'name email role');
//     res.json(meetings);
//   } catch (err) {
//     res.status(500).json({ message: 'Error retrieving system schedule.', error: err.message });
//   }
// };

// exports.updateMeetingStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     if (!['accepted', 'rejected'].includes(status)) {
//       return res.status(400).json({ message: 'Invalid status validation assignment code.' });
//     }
//     const meeting = await Meeting.findByIdAndUpdate(id, { status }, { new: true });
//     if (!meeting) return res.status(404).json({ message: 'Meeting record not found.' });
//     res.json({ message: `Meeting status updated to ${status}.`, meeting });
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating meeting status.', error: err.message });
//   }
// };

// // 📂 DOCUMENT CHAMBER STORAGE
// exports.uploadDocument = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'No file asset uploaded.' });
//     const newDoc = new Document({
//       title: req.body.title || req.file.originalname,
//       filename: req.file.filename,
//       filePath: `/uploads/${req.file.filename}`,
//       uploadedBy: req.user.id
//     });
//     await newDoc.save();
//     res.status(201).json({ message: 'Document uploaded successfully.', document: newDoc });
//   } catch (err) {
//     res.status(500).json({ message: 'Upload execution exception.', error: err.message });
//   }
// };

// exports.getDocuments = async (req, res) => {
//   try {
//     const docs = await Document.find().populate('uploadedBy', 'name email role');
//     res.json(docs);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching files collection data.', error: err.message });
//   }
// };

// exports.applySignature = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { signatureImage } = req.body;
//     if (!signatureImage) return res.status(400).json({ message: 'Signature parameter data is required.' });

//     const document = await Document.findByIdAndUpdate(id, { signatureImage, status: 'signed' }, { new: true });
//     if (!document) return res.status(404).json({ message: 'Document not found.' });

//     res.json({ message: 'E-Signature applied and locked successfully.', document });
//   } catch (err) {
//     res.status(500).json({ message: 'Required improvements processing error during signature update.', error: err.message });
//   }
// };
const Meeting = require('../models/meetingModel');
const Document = require('../models/documentModel');

// MEETINGS
exports.scheduleMeeting = async (req, res) => {
  try {
    const { title, attendee, startTime, endTime } = req.body;

    const host = req.user._id;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const conflict = await Meeting.findOne({
      $or: [{ host }, { attendee: host }],
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time conflict detected' });
    }

    const meeting = await Meeting.create({
      title,
      host,
      attendee,
      startTime: start,
      endTime: end,
      status: 'pending'
    });

    res.status(201).json(meeting);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { attendee: req.user._id }]
    });

    res.json(meetings);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMeetingStatus = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(meeting);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DOCUMENTS
exports.uploadDocument = async (req, res) => {
  try {
    const doc = await Document.create({
      title: req.body.title,
      filename: req.file.filename,
      uploadedBy: req.user._id
    });

    res.status(201).json(doc);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDocuments = async (req, res) => {
  const docs = await Document.find();
  res.json(docs);
};

exports.applySignature = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      {
        signatureImage: req.body.signatureImage,
        status: 'signed'
      },
      { new: true }
    );

    res.json(doc);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};