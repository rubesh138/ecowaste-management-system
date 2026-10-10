const WasteRequest = require('../models/WasteRequest');
const Collection = require('../models/Collection');
const User = require('../models/User');
const {
  notifyAdmins,
  notifyUser,
} = require('../utils/notificationHelper');

// =====================================================
// HELPER: Generate Request ID
// =====================================================

const generateRequestId = async () => {
  const count = await WasteRequest.countDocuments();

  const dateStr = new Date()
    .getFullYear()
    .toString()
    .slice(-2);

  const randomSuffix = Math.floor(100 + Math.random() * 900);

  return `REQ-${dateStr}${count + 101}-${randomSuffix}`;
};

// =====================================================
// HELPER: Extract Numeric Quantity
// =====================================================

const parseQuantity = (quantityStr) => {
  if (!quantityStr) return 5;

  const match = String(quantityStr).match(/(\d+(\.\d+)?)/);

  return match ? parseFloat(match[0]) : 5;
};

// =====================================================
// HELPER: Validate Address
// =====================================================

const isValidAddress = (address) => {
  if (!address) return false;

  const trimmedAddress = String(address).trim();

  // Minimum meaningful length
  if (trimmedAddress.length < 5) {
    return false;
  }

  // Address must contain at least one letter
  if (!/[A-Za-z]/.test(trimmedAddress)) {
    return false;
  }

  // Address must contain at least one alphanumeric character
  if (!/[A-Za-z0-9]/.test(trimmedAddress)) {
    return false;
  }

  return true;
};

// =====================================================
// CREATE REQUEST
// =====================================================

// @desc    Create a new waste collection request
// @route   POST /api/requests
// @access  Private

const createRequest = async (req, res, next) => {
  try {
    const {
      wasteType,
      quantity,
      preferredDate,
      address,
      description,
      image,
      unit = 'kg',
    } = req.body;

    if (
      !wasteType ||
      !quantity ||
      !preferredDate ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate address
    const trimmedAddress = String(address).trim();

    if (!isValidAddress(trimmedAddress)) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid address containing letters, such as 150 Sathy Road.',
      });
    }

    const requestId = await generateRequestId();

    const quantityValue = parseQuantity(quantity);

    const request = await WasteRequest.create({
      requestId,
      citizen: req.user._id,
      assignedEmployee: null,
      wasteType,
      quantity,
      quantityValue,
      unit,
      preferredDate,
      address: trimmedAddress,
      description: description || '',
      image: image || '',
      status: 'Pending',
    });

    await request.populate(
      'citizen',
      'name email phone address'
    );

    // Notify Admins
    await notifyAdmins({
      title: 'New Waste Collection Request',
      message:
        `Citizen ${req.user.name} submitted a new request for ${wasteType} (${quantity}). [${requestId}]`,
      type: 'request',
      relatedRequest: request._id,
    });

    return res.status(201).json({
      success: true,
      message:
        'Your waste collection request has been submitted successfully.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET REQUESTS
// =====================================================

// @desc    Get requests
// @route   GET /api/requests
// @access  Private

const getRequests = async (req, res, next) => {
  try {
    const {
      status,
      search,
      wasteType,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    let query = {};

    // Citizen sees own requests
    if (req.user.role === 'citizen') {
      query.citizen = req.user._id;
    }

    // Employee sees assigned requests
    if (req.user.role === 'employee') {
      query.assignedEmployee = req.user._id;
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Waste type filter
    if (wasteType && wasteType !== 'All') {
      query.wasteType = wasteType;
    }

    // Search
    if (search) {
      query.$or = [
        {
          requestId: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          address: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          wasteType: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const sortOptions = {};

    sortOptions[sortBy] =
      order === 'asc' ? 1 : -1;

    const requests = await WasteRequest.find(query)
      .populate(
        'citizen',
        'name email phone address'
      )
      .populate(
        'assignedEmployee',
        'name email phone address status'
      )
      .sort(sortOptions);

    return res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET REQUEST BY ID
// =====================================================

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private

const getRequestById = async (req, res, next) => {
  try {
    const request = await WasteRequest.findById(
      req.params.id
    )
      .populate(
        'citizen',
        'name email phone address'
      )
      .populate(
        'assignedEmployee',
        'name email phone address status'
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    const isAdmin =
      req.user.role === 'admin';

    const isCitizenOwner =
      req.user.role === 'citizen' &&
      request.citizen._id.toString() ===
        req.user._id.toString();

    const isAssignedEmployee =
      req.user.role === 'employee' &&
      request.assignedEmployee &&
      request.assignedEmployee._id.toString() ===
        req.user._id.toString();

    if (
      !isAdmin &&
      !isCitizenOwner &&
      !isAssignedEmployee
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request',
      });
    }

    return res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE REQUEST
// =====================================================

// @desc    Update waste request
// @route   PUT /api/requests/:id
// @access  Private

const updateRequest = async (req, res, next) => {
  try {
    const request = await WasteRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      request.citizen.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request',
      });
    }

    if (
      req.user.role === 'citizen' &&
      request.status !== 'Pending'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot edit request once it has been processed',
      });
    }

    const {
      wasteType,
      quantity,
      preferredDate,
      address,
      description,
      image,
    } = req.body;

    if (wasteType) {
      request.wasteType = wasteType;
    }

    if (quantity) {
      request.quantity = quantity;
      request.quantityValue = parseQuantity(quantity);
    }

    if (preferredDate) {
      request.preferredDate = preferredDate;
    }

    // Validate address when provided
    if (address !== undefined) {
      const trimmedAddress = String(address).trim();

      if (!isValidAddress(trimmedAddress)) {
        return res.status(400).json({
          success: false,
          message:
            'Please provide a valid address containing letters, such as 150 Sathy Road.',
        });
      }

      request.address = trimmedAddress;
    }

    if (description !== undefined) {
      request.description = description;
    }

    if (image !== undefined) {
      request.image = image;
    }

    const updatedRequest = await request.save();

    await updatedRequest.populate(
      'citizen',
      'name email phone address'
    );

    await updatedRequest.populate(
      'assignedEmployee',
      'name email phone address status'
    );

    return res.json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// DELETE / CANCEL REQUEST
// =====================================================

// @desc    Delete/Cancel request
// @route   DELETE /api/requests/:id
// @access  Private

const deleteRequest = async (req, res, next) => {
  try {
    const request = await WasteRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      request.citizen.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request',
      });
    }

    if (
      req.user.role === 'citizen' &&
      request.status !== 'Pending'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot cancel request once it has been processed',
      });
    }

    await request.deleteOne();

    return res.json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// ACCEPT REQUEST
// =====================================================

// @desc    Accept waste request
// @route   PUT /api/requests/:id/accept
// @access  Private (Admin)

const acceptRequest = async (req, res, next) => {
  try {
    const {
      adminResponse,
      scheduledDate,
    } = req.body;

    const request = await WasteRequest.findById(
      req.params.id
    ).populate(
      'citizen',
      'name email phone address'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    request.status = 'Accepted';

    request.adminResponse =
      adminResponse ||
      'Your waste collection request has been accepted by the municipal team.';

    if (scheduledDate) {
      request.scheduledDate = scheduledDate;
    }

    const updatedRequest = await request.save();

    await notifyUser({
      recipient: request.citizen._id,
      title: 'Waste Request Accepted',
      message:
        `Your waste collection request ${request.requestId} has been accepted.${
          scheduledDate
            ? ` Scheduled for ${new Date(
                scheduledDate
              ).toLocaleDateString()}.`
            : ''
        }`,
      type: 'request',
      relatedRequest: request._id,
    });

    return res.json({
      success: true,
      message: 'Request accepted successfully.',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// REJECT REQUEST
// =====================================================

// @desc    Reject waste request
// @route   PUT /api/requests/:id/reject
// @access  Private (Admin)

const rejectRequest = async (req, res, next) => {
  try {
    const {
      rejectionReason,
      adminResponse,
    } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason',
      });
    }

    const request = await WasteRequest.findById(
      req.params.id
    ).populate(
      'citizen',
      'name email'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    request.status = 'Rejected';

    request.rejectionReason =
      rejectionReason;

    request.adminResponse =
      adminResponse ||
      `Request rejected: ${rejectionReason}`;

    const updatedRequest = await request.save();

    await notifyUser({
      recipient: request.citizen._id,
      title: 'Waste Request Rejected',
      message:
        `Your waste collection request ${request.requestId} was rejected. Reason: ${rejectionReason}`,
      type: 'request',
      relatedRequest: request._id,
    });

    return res.json({
      success: true,
      message: 'Request rejected.',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// SCHEDULE REQUEST
// =====================================================

// @desc    Schedule collection
// @route   PUT /api/requests/:id/schedule
// @access  Private (Admin)

const scheduleRequest = async (req, res, next) => {
  try {
    const {
      scheduledDate,
      adminResponse,
    } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a scheduled collection date',
      });
    }

    const request = await WasteRequest.findById(
      req.params.id
    ).populate(
      'citizen',
      'name email phone address'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    request.status = 'Scheduled';
    request.scheduledDate = scheduledDate;

    if (adminResponse) {
      request.adminResponse = adminResponse;
    } else {
      request.adminResponse =
        `Collection scheduled for ${new Date(
          scheduledDate
        ).toLocaleDateString()}.`;
    }

    const updatedRequest = await request.save();

    await notifyUser({
      recipient: request.citizen._id,
      title: 'Collection Scheduled',
      message:
        `Waste collection for ${request.requestId} has been scheduled for ${new Date(
          scheduledDate
        ).toLocaleDateString()}.`,
      type: 'request',
      relatedRequest: request._id,
    });

    return res.json({
      success: true,
      message: 'Collection scheduled successfully.',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// ASSIGN EMPLOYEE
// =====================================================

// @desc    Assign employee
// @route   PUT /api/requests/:id/assign
// @access  Private (Admin)

const assignEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please select an employee',
      });
    }

    const request = await WasteRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (
      !['Accepted', 'Scheduled'].includes(
        request.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Only accepted or scheduled requests can be assigned to an employee.',
      });
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: 'employee',
      status: 'active',
    }).select(
      'name email phone address status'
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Active employee not found',
      });
    }

    request.assignedEmployee = employee._id;
    request.status = 'Scheduled';

    if (!request.scheduledDate) {
      request.scheduledDate =
        request.preferredDate;
    }

    request.adminResponse =
      `Collection assigned to ${employee.name}.`;

    const updatedRequest = await request.save();

    // Notify Citizen
    await notifyUser({
      recipient: request.citizen,
      title: 'Employee Assigned',
      message:
        `Your ${request.wasteType} collection request ${request.requestId} has been assigned to ${employee.name}.`,
      type: 'request',
      relatedRequest: request._id,
    });

    // Notify Employee
    await notifyUser({
      recipient: employee._id,
      title: 'New Collection Assigned',
      message:
        `You have been assigned request ${request.requestId}: ${request.wasteType}, ${request.quantity}, at ${request.address}.`,
      type: 'request',
      relatedRequest: request._id,
    });

    await updatedRequest.populate(
      'citizen',
      'name email phone address'
    );

    await updatedRequest.populate(
      'assignedEmployee',
      'name email phone address status'
    );

    return res.json({
      success: true,
      message:
        `Collection assigned to ${employee.name} successfully.`,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EMPLOYEE MARK REQUEST AS COLLECTED
// =====================================================

// @desc    Employee marks assigned request as collected
// @route   PUT /api/requests/:id/collect
// @access  Private (Employee)

const collectRequest = async (req, res, next) => {
  try {
    const request = await WasteRequest.findById(
      req.params.id
    )
      .populate(
        'citizen',
        'name email phone'
      )
      .populate(
        'assignedEmployee',
        'name email phone'
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Waste request not found',
      });
    }

    // Check employee assignment
    if (
      !request.assignedEmployee ||
      request.assignedEmployee._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not assigned to this request',
      });
    }

    // Prevent duplicate collection
    const existingCollection =
      await Collection.findOne({
        request: request._id,
      });

    if (existingCollection) {
      return res.status(400).json({
        success: false,
        message:
          'This request has already been collected',
      });
    }

    // Only Accepted/Scheduled
    if (
      !['Accepted', 'Scheduled'].includes(
        request.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Request cannot be collected because its status is ${request.status}`,
      });
    }

    // Extract quantity from request text
    const parsedQuantity =
      parseQuantity(request.quantity);

    const storedQuantity =
      Number(request.quantityValue);

    const quantity =
      parsedQuantity > 0
        ? parsedQuantity
        : storedQuantity;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid waste quantity in request',
      });
    }

    // Create Collection automatically
    const collection =
      await Collection.create({
        request: request._id,
        employee: req.user._id,
        collectionType: 'house',
        locationName: request.address,
        wasteType: request.wasteType,
        quantity,
        collectionDate: new Date(),
        collected: true,
        remarks:
          `Collected from citizen request ${request.requestId}`,
      });

    // Update request
    request.status = 'Collected';

    request.completedAt = new Date();

    request.adminResponse =
      `Waste collected successfully by ${req.user.name}.`;

    await request.save();

    // Notify citizen
    await notifyUser({
      recipient: request.citizen._id,
      title: 'Waste Collected',
      message:
        `Your waste collection request ${request.requestId} has been collected successfully.`,
      type: 'request',
      relatedRequest: request._id,
    });

    // Get updated request
    const updatedRequest =
      await WasteRequest.findById(
        request._id
      )
        .populate(
          'citizen',
          'name email phone'
        )
        .populate(
          'assignedEmployee',
          'name email phone'
        );

    return res.status(200).json({
      success: true,
      message:
        `${quantity} kg of ${request.wasteType} collected successfully`,
      data: {
        request: updatedRequest,
        collection,
      },
    });
  } catch (error) {
    console.error(
      'collectRequest error:',
      error
    );

    next(error);
  }
};

// =====================================================
// UPDATE STATUS
// =====================================================

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private (Admin)

const updateStatus = async (req, res, next) => {
  try {
    const {
      status,
      adminResponse,
    } = req.body;

    const validStatuses = [
      'Pending',
      'Under Review',
      'Accepted',
      'Scheduled',
      'Collected',
      'Completed',
      'Rejected',
    ];

    if (
      !status ||
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const request = await WasteRequest.findById(
      req.params.id
    ).populate(
      'citizen',
      'name email'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    request.status = status;

    if (adminResponse) {
      request.adminResponse =
        adminResponse;
    }

    if (status === 'Completed') {
      request.completedAt = new Date();
    }

    const updatedRequest =
      await request.save();

    await notifyUser({
      recipient: request.citizen._id,
      title: `Request Status: ${status}`,
      message:
        `Your waste collection request ${request.requestId} status has been updated to "${status}".`,
      type: 'request',
      relatedRequest: request._id,
    });

    return res.json({
      success: true,
      message:
        `Request status updated to ${status}.`,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE ADMIN RESPONSE
// =====================================================

// @desc    Update admin response
// @route   PUT /api/requests/:id/response
// @access  Private (Admin)

const updateAdminResponse = async (
  req,
  res,
  next
) => {
  try {
    const { adminResponse } = req.body;

    const request = await WasteRequest.findById(
      req.params.id
    ).populate(
      'citizen',
      'name email'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    request.adminResponse =
      adminResponse || '';

    const updatedRequest =
      await request.save();

    return res.json({
      success: true,
      message: 'Admin response updated',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  acceptRequest,
  rejectRequest,
  scheduleRequest,
  assignEmployee,
  collectRequest,
  updateStatus,
  updateAdminResponse,
};