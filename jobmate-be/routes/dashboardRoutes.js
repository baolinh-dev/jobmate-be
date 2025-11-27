const express = require("express");
const router = express.Router();

const {
  getClientDashboard,
  getFreelancerDashboard
} = require("../controllers/dashboardController");

// Dashboard client
router.get("/client/:clientId", getClientDashboard);

// Dashboard freelancer
router.get("/freelancer/:userId", getFreelancerDashboard);

module.exports = router;
