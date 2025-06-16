router.get('/detail', attendanceController.getAttendanceDetail);

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

module.exports = router;