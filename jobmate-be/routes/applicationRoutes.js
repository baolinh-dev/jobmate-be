const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/auth');
const { applyJob, getApplicationsByJob, updateApplicationStatus } = require('../controllers/applicationControler');

// Freelancer apply job
router.post('/apply', requireLogin, applyJob);

// Client xem tất cả applications của job
router.get('/job/:jobId', requireLogin, getApplicationsByJob);

// Client update application status
router.put('/:applicationId', requireLogin, updateApplicationStatus);

module.exports = router;
