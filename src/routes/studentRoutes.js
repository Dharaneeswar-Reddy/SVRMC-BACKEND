const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// GET result by register_no + year + sem + exam_type
router.get('/:register_no/:year/:sem/:exam_type', studentController.getResultByExam);

module.exports = router;
