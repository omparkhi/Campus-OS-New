const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'ready', 'collected', 'rejected'],
    required: true
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remark: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const RequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['bonafide', 'id_card', 'tc', 'noc', 'migration', 'character'],
    required: true
  },
  description: { type: String },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'ready', 'collected', 'rejected'],
    default: 'submitted'
  },
  adminRemarks: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusHistory: [StatusHistorySchema],
  priority: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
}, { timestamps: true });

// Auto-add initial status on creation
RequestSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: 'submitted',
      timestamp: new Date(),
      remark: 'Request submitted by student'
    });
  }
  next();
});

module.exports = mongoose.model('Request', RequestSchema);
