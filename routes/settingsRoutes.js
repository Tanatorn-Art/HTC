import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';
import { getSettings, updateSettings } from '../controllers/settingsController';

const express = require('express');
const router = express.Router();
const { saveWeComSettings } = require('../controllers/settingsController');

router.post('/', saveWeComSettings);
router.get('/', requireAuth, requireRole(['admin', 'hod']), getSettings);
router.post('/', requireAuth, requireRole(['admin']), updateSettings);

module.exports = router;
export default router;