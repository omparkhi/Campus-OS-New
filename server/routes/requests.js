const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequest,
  updateRequestStatus,
  deleteRequest
} = require('../controllers/requestController');

router.post('/', auth, roleCheck('student'), createRequest);
router.get('/my', auth, roleCheck('student'), getMyRequests);
router.get('/', auth, roleCheck('admin'), getAllRequests);
router.get('/:id', auth, getRequest);
router.patch('/:id/status', auth, roleCheck('admin'), updateRequestStatus);
router.delete('/:id', auth, roleCheck('admin'), deleteRequest);

module.exports = router;
