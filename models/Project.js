const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  completedJobs: { 
    type: String,                   
    default: 'Not started yet',
    trim: true                      
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }]
});

module.exports = mongoose.model('Project', projectSchema);