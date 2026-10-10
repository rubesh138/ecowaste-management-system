const Complaint = require('../models/Complaint');
const { notifyAdmins, notifyUser } = require('../utils/notificationHelper');

// Helper to generate sequential-like Complaint ID
const generateComplaintId = async () => {
  const count = await Complaint.countDocuments();
  const dateStr = new Date().getFullYear().toString().slice(-2);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `CMP-${dateStr}${count + 101}-${randomSuffix}`;
};

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res, next) => {
  try {
    const { category, description, address, image } = req.body;

    if (!category || !description || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const complaintId = await generateComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      citizen: req.user._id,
      category,
      description,
      address,
      image: image || '',
      status: 'Pending',
    });

    await complaint.populate('citizen', 'name email phone address');

    // Notify Admins
    await notifyAdmins({
      title: 'New Citizen Complaint Submitted',
      message: `Citizen ${req.user.name} reported "${category}" at ${address}. [${complaintId}]`,
      type: 'complaint',
      relatedComplaint: complaint._id,
    });

    res.status(201).json({
      success: true,
      message: 'Your complaint has been submitted successfully.',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (Citizen gets own, Admin gets all)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (req.user.role === 'citizen') {
      query.citizen = req.user._id;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('citizen', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('citizen', 'name email phone address');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role !== 'admin' && complaint.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status and admin response
// @route   PUT /api/complaints/:id
// @access  Private (Admin)
const updateComplaint = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findById(req.params.id).populate('citizen', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (adminResponse !== undefined) complaint.adminResponse = adminResponse;

    const updatedComplaint = await complaint.save();

    // Notify Citizen
    await notifyUser({
      recipient: complaint.citizen._id,
      title: `Complaint Updated: ${complaint.status}`,
      message: `Your complaint ${complaint.complaintId} has been updated to "${complaint.status}".${adminResponse ? ` Admin response: "${adminResponse}"` : ''}`,
      type: 'complaint',
      relatedComplaint: complaint._id,
    });

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
};
