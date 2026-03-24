require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const Notification = require('./models/Notification');
const CampusConfig = require('./models/CampusConfig');

const connectDB = require('./config/db');

const DEPARTMENTS = ['CSE', 'Civil', 'Mechanical', 'Electrical', 'Electronics'];
const REQUEST_TYPES = ['bonafide', 'id_card', 'tc', 'noc', 'migration', 'character'];
const STATUSES = ['submitted', 'under_review', 'approved', 'ready', 'collected', 'rejected'];

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany({});
  await Request.deleteMany({});
  await Notification.deleteMany({});
  await CampusConfig.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Dr. Suresh Patil',
    email: 'admin@pbce.ac.in',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
    phone: '9876543210'
  });

  console.log('✅ Admin created: admin@pbce.ac.in / admin123');

  // Create 10 students
  const studentData = [
    { name: 'Aarav Sharma', rollNo: 'CSE2021001', dept: 'CSE', year: 3 },
    { name: 'Priya Desai', rollNo: 'CSE2021002', dept: 'CSE', year: 3 },
    { name: 'Rohan Kulkarni', rollNo: 'CIVIL2022001', dept: 'Civil', year: 2 },
    { name: 'Sneha Joshi', rollNo: 'MECH2020001', dept: 'Mechanical', year: 4 },
    { name: 'Arjun Nair', rollNo: 'CSE2022001', dept: 'CSE', year: 2 },
    { name: 'Kavya Reddy', rollNo: 'ELEC2021001', dept: 'Electrical', year: 3 },
    { name: 'Vikram Tiwari', rollNo: 'CSE2020001', dept: 'CSE', year: 4 },
    { name: 'Ananya Singh', rollNo: 'ELEX2022001', dept: 'Electronics', year: 2 },
    { name: 'Rahul Mehta', rollNo: 'MECH2021001', dept: 'Mechanical', year: 3 },
    { name: 'Pooja Iyer', rollNo: 'CIVIL2020001', dept: 'Civil', year: 4 },
  ];

  const students = [];
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    const student = await User.create({
      name: s.name,
      email: `student${i + 1}@pbce.ac.in`,
      password: 'student123',
      role: 'student',
      department: s.dept,
      year: s.year,
      rollNo: s.rollNo,
      phone: `98765${String(43200 + i).padStart(5, '0')}`
    });
    students.push(student);
  }

  console.log('✅ 10 students created (student1@pbce.ac.in to student10@pbce.ac.in / student123)');

  // Create 20 requests across all statuses and types
  const requestsData = [
    { student: 0, type: 'bonafide', status: 'submitted', desc: 'Needed for SBI bank loan application' },
    { student: 1, type: 'id_card', status: 'under_review', desc: 'Lost ID card, need replacement urgently' },
    { student: 2, type: 'tc', status: 'approved', desc: 'Transferring to VIT Pune for higher studies', remark: 'TC is being processed. Original documents received.' },
    { student: 3, type: 'noc', status: 'ready', desc: 'Internship at TCS, need NOC for HR', remark: 'NOC ready. Please collect before 5 PM today.' },
    { student: 4, type: 'bonafide', status: 'collected', desc: 'Scholarship application at govt portal' },
    { student: 5, type: 'character', status: 'rejected', desc: 'Needed for govt job application', remark: 'Rejected: Please attach HOD recommendation letter first.' },
    { student: 6, type: 'migration', status: 'submitted', desc: 'Applying to Pune University for M.Tech' },
    { student: 7, type: 'noc', status: 'under_review', desc: 'Part-time job at local IT firm' },
    { student: 8, type: 'bonafide', status: 'approved', desc: 'Needed for HDFC education loan', remark: 'Approved. Document being prepared.' },
    { student: 9, type: 'id_card', status: 'ready', desc: 'New student ID card request', remark: 'ID card printed and ready. Collect from Room 101.' },
    { student: 0, type: 'noc', status: 'collected', desc: 'Tech Fest participation at IIT Bombay' },
    { student: 1, type: 'character', status: 'submitted', desc: 'Required for police verification' },
    { student: 2, type: 'bonafide', status: 'under_review', desc: 'Applying for merit scholarship' },
    { student: 3, type: 'id_card', status: 'submitted', desc: 'Annual ID card renewal' },
    { student: 4, type: 'tc', status: 'submitted', desc: 'Moving back to home state' },
    { student: 5, type: 'noc', status: 'approved', desc: 'Hackathon at COEP', remark: 'NOC approved for ICI Ideathon 2026.' },
    { student: 6, type: 'character', status: 'collected', desc: 'Campus placement pre-screening' },
    { student: 7, type: 'bonafide', status: 'ready', desc: 'Education loan from Canara Bank', remark: 'Bonafide certificate ready. Collect anytime.' },
    { student: 8, type: 'migration', status: 'rejected', desc: 'Lateral entry at another college', remark: 'Rejected: Migration requires clearance from accounts dept first.' },
    { student: 9, type: 'noc', status: 'under_review', desc: 'Inter-college sports tournament' },
  ];

  const createdRequests = [];
  for (const rd of requestsData) {
    const req = new Request({
      student: students[rd.student]._id,
      type: rd.type,
      description: rd.desc,
      status: rd.status,
      adminRemarks: rd.remark || '',
      processedBy: rd.status !== 'submitted' ? admin._id : undefined,
      statusHistory: [{ status: 'submitted', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), remark: 'Request submitted by student' }]
    });

    // Add intermediate history
    if (['under_review', 'approved', 'ready', 'collected', 'rejected'].includes(rd.status)) {
      req.statusHistory.push({ status: 'under_review', updatedBy: admin._id, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), remark: 'Request picked up for review' });
    }
    if (['approved', 'ready', 'collected'].includes(rd.status)) {
      req.statusHistory.push({ status: 'approved', updatedBy: admin._id, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), remark: 'Approved' });
    }
    if (['ready', 'collected'].includes(rd.status)) {
      req.statusHistory.push({ status: 'ready', updatedBy: admin._id, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remark: rd.remark || 'Document ready for collection' });
    }
    if (rd.status === 'collected') {
      req.statusHistory.push({ status: 'collected', updatedBy: admin._id, timestamp: new Date(), remark: 'Collected by student' });
    }
    if (rd.status === 'rejected') {
      req.statusHistory.push({ status: 'rejected', updatedBy: admin._id, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remark: rd.remark });
    }

    await req.save();
    createdRequests.push(req);

    // Create notifications for non-submitted requests
    if (rd.status !== 'submitted') {
      await Notification.create({
        user: students[rd.student]._id,
        request: req._id,
        message: `Your ${rd.type.replace('_', ' ')} request status updated to: ${rd.status}`,
        isRead: ['collected', 'rejected'].includes(rd.status)
      });
    }
  }

  console.log('✅ 20 requests created across all statuses and types');

  // Seed CampusConfig
  await CampusConfig.create({
    updatedBy: admin._id
  });

  console.log('✅ CampusConfig seeded with default values');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Login credentials:');
  console.log('  Admin:   admin@pbce.ac.in / admin123');
  console.log('  Student: student1@pbce.ac.in / student123 (through student10@pbce.ac.in)');

  process.exit(0);
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
