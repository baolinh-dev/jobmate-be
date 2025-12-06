const mongoose = require('mongoose');
const Job = require('../models/Job');
const Category = require('../models/Category');

// Tạo job (chỉ client)
const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'client')
      return res.status(403).json({ message: 'Only clients can create jobs' });

    const { title, description, skillsRequired = [], budget, category } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(category))
      return res.status(400).json({ message: 'Invalid category ID' });

    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(404).json({ message: 'Category not found' });

    const job = new Job({
      title,
      description,
      skillsRequired,
      budget,
      category,
      client: req.user.id
    });

    await job.save();
    const populatedJob = await Job.findById(job._id)
      .populate('category', 'name')
      .populate('client', 'name email');

    res.status(201).json(populatedJob);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update job (chỉ client tạo job mới update được)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only update your own jobs' });

    const { title, description, skillsRequired, budget, status, category } = req.body;

    if (title) job.title = title;
    if (description) job.description = description;
    if (budget !== undefined) job.budget = budget;
    if (status) job.status = status;

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category))
        return res.status(400).json({ message: 'Invalid category ID' });

      const categoryExists = await Category.findById(category);
      if (!categoryExists) return res.status(404).json({ message: 'Category not found' });

      job.category = category;
    }

    if (skillsRequired) {
      job.skillsRequired = skillsRequired; // array string
    }

    await job.save();
    const populatedJob = await Job.findById(job._id)
      .populate('category', 'name')
      .populate('client', 'name email');

    res.json(populatedJob);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Xóa job (chỉ client tạo job mới xóa được)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only delete your own jobs' });

    // Xóa trực tiếp bằng findByIdAndDelete
    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả job + pagination
const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const jobs = await Job.find()
      .populate('client', 'name email')
      .populate('category', 'name')
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

const searchJobs = async (req, res) => {
  try {
    let {
      keyword,
      category,
      skills,
      minBudget,
      maxBudget,
      status,
      clientId,
      sort = "newest",
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Keyword search
    if (keyword) {
      const regex = { $regex: keyword, $options: "i" };
      query.$or = [
        { title: regex },
        { description: regex },
        { skillsRequired: regex }
      ];
    }

    // Category
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    // Client
    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      query.client = clientId;
    }

    // Skills filter
    if (skills) {
      const skillsArr = skills.split(",").map(s => s.trim());
      query.skillsRequired = { $all: skillsArr };
    }

    // Budget range FIXED
    if (minBudget || maxBudget) {
      query.budget = { $ne: null }; // loại null

      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    // Status
    if (status) query.status = status;

    // Pagination
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    // Sorting
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highestBudget: { budget: -1 },
      lowestBudget: { budget: 1 },
    };

    const sortQuery = sortOptions[sort] || sortOptions.newest;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("client", "name email")
        .populate("category", "name")
        .skip(skip)
        .limit(limit)
        .sort(sortQuery),
      Job.countDocuments(query)
    ]);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      sort,
      jobs
    });

  } catch (error) {
    console.error("SearchJobs Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Lấy 1 job theo id
// Thay đổi file jobController.js của bạn như sau:

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email')
      .populate('category', 'name'); // 💡 THÊM DÒNG NÀY ĐỂ LẤY TÊN DANH MỤC!

    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, searchJobs };
