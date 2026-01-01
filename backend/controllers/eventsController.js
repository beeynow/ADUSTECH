const Event = require('../models/Event');
const cloudinary = require('../utils/cloudinary');

exports.createEvent = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!['power','admin','d-admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only admins can create events' });
    }
    let { title = '', details = '', imageBase64 = '', location = '', startsAt } = req.body;

    title = String(title || '').trim();
    details = String(details || '').trim();
    location = String(location || '').trim();
    const startDate = new Date(startsAt);
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!startsAt || isNaN(startDate.getTime())) return res.status(400).json({ message: 'Valid startsAt is required' });

    let imageUrl = '';
    if (imageBase64) {
      const match = /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i.exec(imageBase64);
      if (!match) return res.status(400).json({ message: 'Invalid image format' });
      const uploadRes = await cloudinary.uploader.upload(imageBase64, { folder: 'adustech/events', resource_type: 'image' });
      imageUrl = uploadRes.secure_url;
      imageBase64 = '';
    }

    // Auto-expire 30 minutes after start
    const expireAt = new Date(startDate.getTime() + 30 * 60 * 1000);

    const event = await Event.create({
      title,
      details,
      imageUrl,
      imageBase64,
      location,
      startsAt: startDate,
      expireAt,
      createdBy: user.id,
      createdByName: user.name || user.email,
    });
    res.status(201).json({ message: 'Event created', event });
  } catch (e) {
    console.error('createEvent error', e);
    res.status(500).json({ message: 'Error creating event' });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const now = new Date();
    // List events that have not expired yet (Mongo TTL will remove expired ones)
    const events = await Event.find({ expireAt: { $gt: now } }).sort({ startsAt: 1 });
    res.json({ events });
  } catch (e) {
    console.error('listEvents error', e);
    res.status(500).json({ message: 'Error listing events' });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (e) {
    console.error('getEvent error', e);
    res.status(500).json({ message: 'Error fetching event' });
  }
};
