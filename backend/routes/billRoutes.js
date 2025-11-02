const express = require('express');
const router = express.Router();
const {
  uploadBillAndExtractText,
  getBillPdf,
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.post('/bills', protect, uploadBillAndExtractText);
router.get('/:id/pdf', protect, getBillPdf);

module.exports = router;