const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/auth');
const { applyJob, getApplicationsByJob, updateApplicationStatus, getClientAllApplications } = require('../controllers/applicationControler');

// Freelancer apply job
router.post('/apply', requireLogin, applyJob);

// Client xem tất cả applications của job
router.get('/job/:jobId', requireLogin, getApplicationsByJob);

// Client update application status
router.put('/:applicationId', requireLogin, updateApplicationStatus);

// Ví dụ về route (router.js)
router.get('/client/all', requireLogin, getClientAllApplications);

module.exports = router;
