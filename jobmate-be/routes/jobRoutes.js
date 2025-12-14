const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, updateJob, deleteJob, searchJobs } = require('../controllers/jobController');
const requireLogin = require('../middlewares/auth');

// Tất cả route đều yêu cầu login
router.use(requireLogin);

// CRUD job
router.post('/', createJob);
router.get('/', getJobs);
router.get('/search', searchJobs);
router.get('/:id', getJobById);
router.put('/:id', updateJob);
router.patch('/:id', updateJob); // Support PATCH method
router.delete('/:id', deleteJob);

module.exports = router;
