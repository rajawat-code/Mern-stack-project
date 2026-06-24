const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
  },
  designation: {
    type: String,
    required: [true, 'Designation/Title is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
  },
  description: {
    type: String,
    default: '',
  },
  currentCompany: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Experience', ExperienceSchema);
