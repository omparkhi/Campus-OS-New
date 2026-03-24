const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { chat, updateConfig, getConfig } = require('../controllers/chatController');

router.post('/', auth, roleCheck('student'), chat);
router.get('/config', auth, getConfig);
router.put('/config', auth, roleCheck('admin'), updateConfig);

module.exports = router;
