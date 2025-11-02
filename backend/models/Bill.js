const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  textExtract: { type: String },
  redactedText: { type: String },
  pii: { type: Array, default: [] },
  includePII: { type: Boolean, default: false },
  processedReport: { type: Object },
  processedAt: { type: Date }
});

module.exports = mongoose.model('Bill', BillSchema);
