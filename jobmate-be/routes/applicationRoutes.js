const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/auth');
const { applyJob, getApplicationsByJob, updateApplicationStatus, getClientAllApplications, getFreelancerAllApplications } = require('../controllers/applicationControler');

// Freelancer apply job
router.post('/apply', requireLogin, applyJob);

// Client xem tất cả applications của job
router.get('/job/:jobId', requireLogin, getApplicationsByJob);

// Ví dụ về route (router.js)
router.get('/client/all', requireLogin, getClientAllApplications);


router.get("/freelancer/applications", requireLogin, getFreelancerAllApplications);

// Client update application status
router.put('/:applicationId', requireLogin, updateApplicationStatus); 




module.exports = router;
