const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');

router.get('/department', orgController.getDepartments);

router.post('/departments/id/hod', orgController.updateHOD);

module.exports = router;