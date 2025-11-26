const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  skillsRequired: [{ type: String }], 
  budget: Number,
  status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
