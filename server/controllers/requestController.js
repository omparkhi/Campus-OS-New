const Request = require('../models/Request');
const Notification = require('../models/Notification');

const STATUS_MESSAGES = {
  under_review: 'Your request is now under review by the admin.',
  approved: 'Your request has been approved! Document is being prepared.',
  ready: 'Your document is ready to collect from the admin office.',
  collected: 'Your request has been marked as collected. Thank you!',
  rejected: 'Your request has been rejected. Please check the remarks.'
};

const REQUEST_LABELS = {
  bonafide: 'Bonafide Certificate',
  id_card: 'ID Card',
  tc: 'Transfer Certificate',
  noc: 'NOC',
  migration: 'Migration Certificate',
  character: 'Character Certificate'
};

// Student: Submit new request
exports.createRequest = async (req, res) => {
  try {
    const { type, description, priority } = req.body;
    const request = await Request.create({
      student: req.user._id,
      type,
      description,
      priority: priority || 'normal'
    });

    const populated = await Request.findById(request._id).populate('student', 'name email rollNo department');

    // Emit socket event to admin room
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('request:created', populated);
    }

    res.status(201).json({ success: true, request: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Get my requests
exports.getMyRequests = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = { student: req.user._id };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const requests = await Request.find(filter)
      .populate('processedBy', 'name')
      .sort({ updatedAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const { status, type, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    let query = Request.find(filter)
      .populate('student', 'name email rollNo department year')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    const requests = await query;

    // Filter by department after population
    const filtered = department
      ? requests.filter(r => r.student?.department === department)
      : requests;

    res.json({ success: true, requests: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single request with full history
exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('student', 'name email rollNo department year phone')
      .populate('processedBy', 'name email')
      .populate('statusHistory.updatedBy', 'name');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Student can only see their own requests
    if (req.user.role === 'student' && request.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update request status (THE CORE Socket.io moment)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, remark } = req.body;
    const request = await Request.findById(req.params.id).populate('student', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status;
    request.adminRemarks = remark || request.adminRemarks;
    request.processedBy = req.user._id;
    request.statusHistory.push({
      status,
      updatedBy: req.user._id,
      remark: remark || '',
      timestamp: new Date()
    });

    await request.save();

    const populated = await Request.findById(request._id)
      .populate('student', 'name email rollNo department')
      .populate('processedBy', 'name');

    // Create notification
    const notifMessage = remark
      ? `${STATUS_MESSAGES[status]} Remark: ${remark}`
      : STATUS_MESSAGES[status] || `Your ${REQUEST_LABELS[request.type]} request has been updated to: ${status}`;

    const notification = await Notification.create({
      user: request.student._id,
      request: request._id,
      message: notifMessage,
      type: status === 'rejected' ? 'rejection' : status === 'ready' ? 'ready' : 'status_update'
    });

    // Emit Socket.io event to SPECIFIC student room
    const io = req.app.get('io');
    if (io) {
      const eventName = status === 'rejected' ? 'request:rejected' : status === 'collected' ? 'request:completed' : 'request:updated';
      io.to(`student:${request.student._id}`).emit(eventName, { request: populated, notification });
      io.to('admin_room').emit('request:updated', populated);
    }

    res.json({ success: true, request: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete request
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
