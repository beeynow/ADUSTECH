const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  details: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  imageBase64: { type: String, default: '' },
  location: { type: String, default: '' },
  startsAt: { type: Date, required: true },
  expireAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
