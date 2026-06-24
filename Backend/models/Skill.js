const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillName: {
    type: String,
    required: [true, 'Skill name is required'],
  },
  endorsementCount: {
    type: Number,
    default: 0,
  },
  endorsedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Skill', SkillSchema);
