const User = require('../models/User');
const WasteRequest = require('../models/WasteRequest');
const Complaint = require('../models/Complaint');
const Collection = require('../models/Collection');

// ============================================================
// GET ALL CITIZENS
// ============================================================

// @desc    Get all citizens
// @route   GET /api/users
// @access  Private (Admin)

const getUsers = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    let query = {
      role: 'citizen',
    };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          phone: {
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
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({
        createdAt: -1,
      });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalRequests =
          await WasteRequest.countDocuments({
            citizen: user._id,
          });

        const totalComplaints =
          await Complaint.countDocuments({
            citizen: user._id,
          });

        return {
          ...user.toObject(),
          totalRequests,
          totalComplaints,
        };
      })
    );

    res.json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL EMPLOYEES
// ============================================================

// @desc    Get all employees
// @route   GET /api/users/employees
// @access  Private (Admin)

const getEmployees = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    let query = {
      role: 'employee',
    };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          phone: {
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
      ];
    }

    const employees = await User.find(query)
      .select('-password')
      .sort({
        createdAt: -1,
      });

    const employeesWithStats = await Promise.all(
      employees.map(async (employee) => {
        const collectionStats =
          await Collection.aggregate([
            {
              $match: {
                employee: employee._id,
                collected: true,
              },
            },
            {
              $group: {
                _id: null,

                totalQuantity: {
                  $sum: '$quantity',
                },

                totalCollections: {
                  $sum: 1,
                },
              },
            },
          ]);

        const stats = collectionStats[0] || {
          totalQuantity: 0,
          totalCollections: 0,
        };

        return {
          ...employee.toObject(),

          totalQuantity: stats.totalQuantity,

          totalCollections: stats.totalCollections,
        };
      })
    );

    res.json({
      success: true,
      count: employeesWithStats.length,
      data: employeesWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE USER / EMPLOYEE
// ============================================================

// @desc    Get single user details with history
// @route   GET /api/users/:id
// @access  Private (Admin)

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Employee details
    if (user.role === 'employee') {
      const collections = await Collection.find({
        employee: user._id,
      }).sort({
        collectionDate: -1,
        createdAt: -1,
      });

      const collectionStats =
        await Collection.aggregate([
          {
            $match: {
              employee: user._id,
              collected: true,
            },
          },
          {
            $group: {
              _id: null,

              totalQuantity: {
                $sum: '$quantity',
              },

              totalCollections: {
                $sum: 1,
              },
            },
          },
        ]);

      const stats = collectionStats[0] || {
        totalQuantity: 0,
        totalCollections: 0,
      };

      return res.json({
        success: true,
        data: {
          ...user.toObject(),

          collections,

          totalQuantity: stats.totalQuantity,

          totalCollections:
            stats.totalCollections,
        },
      });
    }

    // Citizen details
    const requests = await WasteRequest.find({
      citizen: user._id,
    }).sort({
      createdAt: -1,
    });

    const complaints = await Complaint.find({
      citizen: user._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        requests,
        complaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE USER STATUS
// ============================================================

// @desc    Activate / deactivate user
// @route   PUT /api/users/:id/status
// @access  Private (Admin)

const updateUserStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const user = await User.findById(
      req.params.id
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Protect primary admin
    if (
      user.role === 'admin' &&
      user.email === 'admin@smartwaste.gov'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Primary admin account cannot be deactivated',
      });
    }

    user.status = status;

    await user.save();

    res.json({
      success: true,

      message:
        status === 'active'
          ? 'User account has been activated'
          : 'User account has been deactivated',

      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CREATE EMPLOYEE
// ============================================================

// @desc    Create a new employee
// @route   POST /api/users/employees
// @access  Private (Admin)

const createEmployee = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      password,
      profilePhoto,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide name, email, phone, address and password',
      });
    }

    // Validate address
    const trimmedAddress = address.trim();

    if (trimmedAddress.length < 5) {
      return res.status(400).json({
        success: false,
        message:
          'Address must be at least 5 characters',
      });
    }

    if (!/[A-Za-z]/.test(trimmedAddress)) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid address containing letters',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'Employee password must be at least 6 characters',
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          'An account with this email already exists',
      });
    }

    const normalizedPhone =
      normalizeIndianPhone(phone);

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message:
          'Phone number must contain exactly 10 digits',
      });
    }

    const employee = await User.create({
      name: name.trim(),

      email: normalizedEmail,

      phone: normalizedPhone,

      address: trimmedAddress,

      password,

      role: 'employee',

      status: 'active',

      profilePhoto:
        typeof profilePhoto === 'string'
          ? profilePhoto
          : '',
    });

    res.status(201).json({
      success: true,

      message:
        'Employee account created successfully',

      data: {
        _id: employee._id,

        name: employee.name,

        email: employee.email,

        phone: employee.phone,

        address: employee.address,

        profilePhoto: employee.profilePhoto,

        role: employee.role,

        status: employee.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE EMPLOYEE
// ============================================================

// @desc    Edit employee details
// @route   PUT /api/users/employees/:id
// @access  Private (Admin)

const updateEmployee = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      password,
      profilePhoto,
    } = req.body;

    const employee = await User.findOne({
      _id: req.params.id,
      role: 'employee',
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // ========================================================
    // NAME
    // ========================================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty',
        });
      }

      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message:
            'Name must be at least 2 characters',
        });
      }

      employee.name = name.trim();
    }

    // ========================================================
    // EMAIL
    // ========================================================

    if (email !== undefined) {
      const normalizedEmail = email
        .toLowerCase()
        .trim();

      const emailExists = await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: employee._id,
        },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message:
            'An account with this email already exists',
        });
      }

      employee.email = normalizedEmail;
    }

    // ========================================================
    // PHONE
    // ========================================================

    if (phone !== undefined) {
      const normalizedPhone =
        normalizeIndianPhone(phone);

      if (!normalizedPhone) {
        return res.status(400).json({
          success: false,
          message:
            'Phone number must contain exactly 10 digits',
        });
      }

      employee.phone = normalizedPhone;
    }

    // ========================================================
    // ADDRESS
    // ========================================================

    if (address !== undefined) {
      const trimmedAddress = address.trim();

      if (!trimmedAddress) {
        return res.status(400).json({
          success: false,
          message: 'Address cannot be empty',
        });
      }

      if (trimmedAddress.length < 5) {
        return res.status(400).json({
          success: false,
          message:
            'Address must be at least 5 characters',
        });
      }

      if (!/[A-Za-z]/.test(trimmedAddress)) {
        return res.status(400).json({
          success: false,
          message:
            'Please provide a valid address containing letters',
        });
      }

      employee.address = trimmedAddress;
    }

    // ========================================================
    // PROFILE PHOTO
    // ========================================================

    if (profilePhoto !== undefined) {
      if (
        typeof profilePhoto !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile photo',
        });
      }

      employee.profilePhoto =
        profilePhoto;
    }

    // ========================================================
    // PASSWORD
    // ========================================================

    if (
      password !== undefined &&
      password !== ''
    ) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            'Password must be at least 6 characters',
        });
      }

      employee.password = password;
    }

    await employee.save();

    const updatedEmployee =
      await User.findById(employee._id)
        .select('-password');

    res.json({
      success: true,

      message:
        'Employee details updated successfully',

      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// NORMALIZE INDIAN PHONE NUMBER
// ============================================================

const normalizeIndianPhone = (
  phone
) => {
  if (!phone) {
    return null;
  }

  let digits = String(phone)
    .replace(/\s+/g, '')
    .replace(/^\+91/, '')
    .replace(/^91/, '');

  if (!/^\d{10}$/.test(digits)) {
    return null;
  }

  return `+91 ${digits}`;
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getUsers,
  getEmployees,
  getUserById,
  updateUserStatus,
  createEmployee,
  updateEmployee,
};