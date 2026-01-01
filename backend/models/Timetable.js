const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  details: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  effectiveDate: { type: Date, required: true },
  expireAt: { type: Date, required: true, index: { expires: 0 } },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);
