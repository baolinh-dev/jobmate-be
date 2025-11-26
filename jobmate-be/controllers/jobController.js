const Job = require('../models/Job');

// Tạo job (chỉ client)
const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'client') 
      return res.status(403).json({ message: 'Only clients can create jobs' });

    const { title, description, skillsRequired, budget, category } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const job = new Job({
      title,
      description,
      skillsRequired,
      budget,
      category,          // NEW
      client: req.user.id
    });

    await job.save();
    res.status(201).json(job);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // default page 1, 10 job/trang
    const skip = (page - 1) * limit;

    const jobs = await Job.find()
      .populate('client', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments();

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      jobs
    });

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

    const { title, description, skillsRequired, budget, status, category } = req.body;

    if(title) job.title = title;
    if(description) job.description = description;
    if(skillsRequired) job.skillsRequired = skillsRequired;
    if(budget) job.budget = budget;
    if(status) job.status = status;
    if(category) job.category = category;     // NEW

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

// SEARCH + FILTER
const searchJobs = async (req, res) => {
  try {
    const { keyword, category, type, page = 1, limit = 10 } = req.query;

    let query = {};

    // Tìm theo keyword (title + description)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Lọc theo danh mục
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      jobs
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, searchJobs };
