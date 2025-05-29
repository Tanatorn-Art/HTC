const express = require('express');
const router = express.Router();
const wecomController = require('../controllers/wecomController');

router.post('/Wecomsend', wecomController.sendWeComMessageFromView);

module.exports = router;;