const Job = require("../models/Job");
const Application = require("../models/Application");
const mongoose = require("mongoose");

// ====================== CLIENT DASHBOARD ======================
const getClientDashboard = async (req, res) => {
  try {
    const clientId = req.params.clientId;

    // Tổng job theo trạng thái
    const totalJobs = await Job.countDocuments({ client: clientId });
    const openJobs = await Job.countDocuments({ client: clientId, status: "open" });
    const inProgressJobs = await Job.countDocuments({ client: clientId, status: "in_progress" });
    const completedJobs = await Job.countDocuments({ client: clientId, status: "completed" });

    // Lấy tất cả job ID thuộc client
    const clientJobs = await Job.find({ client: clientId }).select("_id");

    const jobIds = clientJobs.map((j) => j._id);

    // Tổng application vào job client
    const totalApplications = await Application.countDocuments({
      jobId: { $in: jobIds }
    });

    // Top job nhiều ứng tuyển nhất
    const topJobs = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "_id",
          as: "job"
        }
      },
      { $unwind: "$job" }
    ]);

    // Application mới nhất
    const latestApplications = await Application.find({
      jobId: { $in: jobIds }
    })
      .populate("candidateId", "name email")
      .populate("jobId", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalJobs,
        openJobs,
        inProgressJobs,
        completedJobs,
        totalApplications
      },
      topJobs,
      latestApplications
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== FREELANCER DASHBOARD ======================
const getFreelancerDashboard = async (req, res) => {
  try {
    const userId = req.params.userId;

    // validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    // Tổng số hồ sơ ứng tuyển
    const totalApplied = await Application.countDocuments({ freelancer: userId });
    const pending = await Application.countDocuments({ freelancer: userId, status: "applied" }); // nếu bạn dùng 'applied' thay 'pending'
    const accepted = await Application.countDocuments({ freelancer: userId, status: "accepted" });
    const rejected = await Application.countDocuments({ freelancer: userId, status: "rejected" });

    // Ứng tuyển mới nhất (populate job -> title, category)
    const latestApps = await Application.find({ freelancer: userId })
      .populate({
        path: 'job',
        select: 'title category',
        populate: { path: 'category', select: 'name' } // optional: populate category name
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Category ứng tuyển nhiều nhất → job gợi ý
    const topCategoryAgg = await Application.aggregate([
      { $match: { freelancer: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "job"
        }
      },
      { $unwind: "$job" },
      { $group: { _id: "$job.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    let recommendedJobs = [];
    if (topCategoryAgg.length > 0 && topCategoryAgg[0]._id) {
      const topCategoryId = topCategoryAgg[0]._id;
      recommendedJobs = await Job.find({
        category: topCategoryId,
        status: "open"
      })
      .populate('client', 'name email')
      .populate('category', 'name')
      .limit(5)
      .sort({ createdAt: -1 });
    }

    res.json({
      summary: {
        totalApplied,
        pending,
        accepted,
        rejected
      },
      latestApplications: latestApps,
      recommendedJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getClientDashboard,
  getFreelancerDashboard
};
