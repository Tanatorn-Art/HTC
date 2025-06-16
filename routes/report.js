const express = require('express');
const router = express.Router();
const { exportReport } = require('../controllers/reportController');
const { reportSchema } = require('./schemas/reportSchema');
const { validate } = require('../middlewares/validate');

router.get('/export', exportReport);
router.get('/export', validate(reportSchema), exportReport);
router.get('/report', reportController.getFilteredReport);

module.exports = router;
 