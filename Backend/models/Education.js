const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collegeName: {
    type: String,
    required: [true, 'College/University name is required'],
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
  },
  grade: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Education', EducationSchema);
