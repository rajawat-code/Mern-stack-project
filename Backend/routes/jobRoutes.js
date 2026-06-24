const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createJobValidator } = require('../validators/jobValidator');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/', jobController.searchJobs);
router.get('/applied', jobController.getAppliedJobs);
router.get('/:id', jobController.getJobDetails);
router.get('/:id/applicants', jobController.getApplicants);

router.post('/', createJobValidator, validate, jobController.createJob);
router.put('/:id', createJobValidator, validate, jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

router.post('/:id/apply', upload.single('resume'), jobController.applyJob);

module.exports = router;
