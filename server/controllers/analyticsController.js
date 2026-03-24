const Request = require('../models/Request');
const User = require('../models/User');

exports.getOverview = async (req, res) => {
  try {
    const total = await Request.countDocuments();
    const pending = await Request.countDocuments({ status: { $in: ['submitted', 'under_review'] } });
    const approved = await Request.countDocuments({ status: 'approved' });
    const ready = await Request.countDocuments({ status: 'ready' });
    const collected = await Request.countDocuments({ status: 'collected' });
    const rejected = await Request.countDocuments({ status: 'rejected' });

    // Requests this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = await Request.countDocuments({ createdAt: { $gte: weekAgo } });

    // Avg processing time (for collected requests)
    const collectedRequests = await Request.find({ status: 'collected' });
    let avgProcessingMs = 0;
    if (collectedRequests.length > 0) {
      const totalMs = collectedRequests.reduce((sum, r) => sum + (r.updatedAt - r.createdAt), 0);
      avgProcessingMs = totalMs / collectedRequests.length;
    }
    const avgProcessingDays = Math.round(avgProcessingMs / (1000 * 60 * 60 * 24));

    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      success: true,
      stats: { total, pending, approved, ready, collected, rejected, thisWeek, avgProcessingDays, totalStudents }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getByType = async (req, res) => {
  try {
    const byType = await Request.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byStatus = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Last 7 days trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await Request.countDocuments({ createdAt: { $gte: start, $lte: end } });
      last7Days.push({
        date: start.toISOString().split('T')[0],
        count
      });
    }

    res.json({ success: true, byType, byStatus, last7Days });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
