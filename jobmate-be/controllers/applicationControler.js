const Application = require('../models/Application');
const Job = require('../models/Job');

// Freelancer apply job
const applyJob = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can apply' });
    }

    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if already applied
    const exist = await Application.findOne({ job: jobId, freelancer: req.user.id });
    if (exist) return res.status(400).json({ message: 'You already applied to this job' });

    const application = new Application({
      job: jobId,
      freelancer: req.user.id,
      coverLetter
    });

    await application.save();

    res.status(201).json(application);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Client xem tất cả ứng tuyển của 1 job
const getApplicationsByJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only view applications for your own jobs' });

    const applications = await Application.find({ job: job._id })
      .populate('freelancer', 'name email');

    res.json(applications);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Client chấp nhận/reject application
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted/rejected
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.job.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only update applications for your own jobs' });

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    application.status = status;
    await application.save();

    res.json(application);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyJob, getApplicationsByJob, updateApplicationStatus };
