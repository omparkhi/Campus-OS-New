const mongoose = require('mongoose');

const CampusConfigSchema = new mongoose.Schema({
  processingTimes: {
    type: Object,
    default: {
      bonafide: '2-3 days',
      id_card: '3-5 days',
      tc: '5-7 days',
      noc: '1-2 days',
      migration: '7-10 days',
      character: '2-3 days'
    }
  },
  requiredDocuments: {
    type: Object,
    default: {
      bonafide: ['Student ID', 'Fee receipt of current semester'],
      id_card: ['Passport photo (2 copies)', 'Fee receipt', 'Previous ID card (if replacement)'],
      tc: ['Fee clearance certificate', 'Library NOC', 'Hostel NOC (if applicable)', 'Original ID card'],
      noc: ['Application letter', 'Event/internship details', 'HOD approval form'],
      migration: ['TC from current college', 'Mark sheets (all semesters)', 'Fee clearance', 'Character certificate'],
      character: ['Student ID', 'Request application letter']
    }
  },
  officeHours: {
    type: String,
    default: 'Monday to Friday: 9:00 AM – 5:00 PM | Lunch break: 1:00 PM – 2:00 PM | Saturday: 9:00 AM – 1:00 PM'
  },
  importantNotes: {
    type: [String],
    default: [
      'All requests are processed in 2-10 working days depending on type.',
      'Original documents must be submitted physically at the admin office for TC and Migration.',
      'SMS and portal notifications are sent for every status update.',
      'Contact admin office at ext. 101 for urgent requests.'
    ]
  },
  contactInfo: {
    type: Object,
    default: {
      phone: '+91-712-XXXXXXX',
      email: 'admin@pbce.ac.in',
      location: 'Administrative Block, Ground Floor, Room 101',
      whatsapp: '+91-9XXXXXXXXX'
    }
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('CampusConfig', CampusConfigSchema);
