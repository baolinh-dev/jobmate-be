const Job = require('../models/Job');

// Tạo job (chỉ client)
const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'client') 
      return res.status(403).json({ message: 'Only clients can create jobs' });

    const { title, description, skillsRequired, budget } = req.body;
    const job = new Job({
      title,
      description,
      client: req.user.id,
      skillsRequired,
      budget
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả job (dành cho freelancer)
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('client', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy 1 job theo id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('client', 'name email');
    if(!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

// Update job (chỉ client tạo job mới update được)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if(!job) return res.status(404).json({ message: 'Job not found' });

    if(job.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only update your own jobs' });

    const { title, description, skillsRequired, budget, status } = req.body;
    if(title) job.title = title;
    if(description) job.description = description;
    if(skillsRequired) job.skillsRequired = skillsRequired;
    if(budget) job.budget = budget;
    if(status) job.status = status;

    await job.save();
    res.json(job);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa job (chỉ client tạo job mới xóa được)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if(!job) return res.status(404).json({ message: 'Job not found' });

    if(job.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only delete your own jobs' });

    // Xóa trực tiếp bằng findByIdAndDelete
    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
