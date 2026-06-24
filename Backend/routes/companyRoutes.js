const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createCompanyValidator } = require('../validators/jobValidator');
const validate = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/', companyController.searchCompanies);
router.get('/:id', companyController.getCompany);
router.post('/', upload.single('logo'), createCompanyValidator, validate, companyController.createCompany);
router.put('/:id', upload.single('logo'), createCompanyValidator, validate, companyController.updateCompany);
router.post('/:id/follow', companyController.toggleFollow);

module.exports = router;
