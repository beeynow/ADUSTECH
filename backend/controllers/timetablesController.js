const Timetable = require('../models/Timetable');
const cloudinary = require('../utils/cloudinary');

exports.createTimetable = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!['power','admin','d-admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only admins can create timetables' });
    }

    let { title = '', details = '', imageBase64 = '', pdfBase64 = '', effectiveDate } = req.body;
    title = String(title || '').trim();
    details = String(details || '').trim();
    const date = new Date(effectiveDate);
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!effectiveDate || isNaN(date.getTime())) return res.status(400).json({ message: 'Valid effectiveDate is required' });

    let imageUrl = '';
    if (imageBase64) {
      const match = /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i.exec(imageBase64);
      if (!match) return res.status(400).json({ message: 'Invalid image format' });
      const uploadRes = await cloudinary.uploader.upload(imageBase64, { folder: 'adustech/timetables', resource_type: 'image' });
      imageUrl = uploadRes.secure_url;
      imageBase64 = '';
    }

    let pdfUrl = '';
    if (pdfBase64) {
      const matchPdf = /^data:(application\/pdf);base64,(.+)$/i.exec(pdfBase64);
      if (!matchPdf) return res.status(400).json({ message: 'Invalid PDF format' });
      const uploadPdf = await cloudinary.uploader.upload(pdfBase64, { folder: 'adustech/timetables', resource_type: 'raw', public_id: `tt_${Date.now()}` });
      pdfUrl = uploadPdf.secure_url;
      pdfBase64 = '';
    }

    const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);

    const row = await Timetable.create({
      title,
      details,
      imageUrl,
      pdfUrl,
      effectiveDate: date,
      expireAt: endOfDay,
      createdBy: user.id,
      createdByName: user.name || user.email,
    });
    res.status(201).json({ message: 'Timetable created', timetable: row });
  } catch (e) {
    console.error('createTimetable error', e);
    res.status(500).json({ message: 'Error creating timetable' });
  }
};

exports.listTimetables = async (_req, res) => {
  try {
    const now = new Date();
    const list = await Timetable.find({ expireAt: { $gt: now } }).sort({ effectiveDate: 1 });
    res.json({ timetables: list });
  } catch (e) {
    console.error('listTimetables error', e);
    res.status(500).json({ message: 'Error listing timetables' });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Timetable.findById(id);
    if (!row) return res.status(404).json({ message: 'Timetable not found' });
    res.json({ timetable: row });
  } catch (e) {
    console.error('getTimetable error', e);
    res.status(500).json({ message: 'Error fetching timetable' });
  }
};
