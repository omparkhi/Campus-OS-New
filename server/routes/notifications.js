const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.get('/', auth, roleCheck('student'), getNotifications);
router.patch('/:id/read', auth, roleCheck('student'), markAsRead);
router.patch('/read-all', auth, roleCheck('student'), markAllAsRead);

module.exports = router;
