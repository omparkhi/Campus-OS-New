const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getOverview, getByType } = require('../controllers/analyticsController');

router.get('/overview', auth, roleCheck('admin'), getOverview);
router.get('/by-type', auth, roleCheck('admin'), getByType);

module.exports = router;
