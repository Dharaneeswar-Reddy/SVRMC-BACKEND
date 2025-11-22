const express = require('express');
const router = express.Router();
const multer = require('multer');

const adminController = require('../controllers/adminController');

// simple memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', adminController.login);
router.post('/upload', upload.single('file'), adminController.uploadCSV);

module.exports = router;
