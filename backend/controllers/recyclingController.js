const RecyclingRecord = require('../models/RecyclingRecord');
const Collection = require('../models/Collection');


// =====================================================
// GENERATE RECYCLING RECORD ID
// =====================================================

const generateRecordId = async () => {
  const count = await RecyclingRecord.countDocuments();

  const dateStr = new Date()
    .getFullYear()
    .toString()
    .slice(-2);

  const randomSuffix = Math.floor(100 + Math.random() * 900);

  return `REC-${dateStr}${count + 101}-${randomSuffix}`;
};


// =====================================================
// GET WASTE STOCK
// =====================================================

const getWasteStock = async (wasteType, excludeRecordId = null) => {
  // Total waste actually collected by employees
  const collectedRecords = await Collection.find({
    wasteType: wasteType,
    collected: true,
  });

  const totalCollected = collectedRecords.reduce(
    (total, record) => total + Number(record.quantity || 0),
    0
  );


  // Recycling records which are currently consuming stock
  const recyclingQuery = {
    wasteType: wasteType,
    status: {
      $in: ['Received', 'Processing', 'Recycled'],
    },
  };

  // When editing an existing record,
  // don't count that same record twice.
  if (excludeRecordId) {
    recyclingQuery._id = {
      $ne: excludeRecordId,
    };
  }


  const activeRecyclingRecords =
    await RecyclingRecord.find(recyclingQuery);


  const totalUsedForRecycling =
    activeRecyclingRecords.reduce(
      (total, record) =>
        total + Number(record.quantity || 0),
      0
    );


  const available =
    totalCollected - totalUsedForRecycling;


  return {
    collected: Number(totalCollected.toFixed(1)),
    used: Number(totalUsedForRecycling.toFixed(1)),
    available: Number(
      Math.max(available, 0).toFixed(1)
    ),
  };
};


// =====================================================
// GET ALL RECYCLING RECORDS
// =====================================================

// @desc    Get all recycling records and summary statistics
// @route   GET /api/recycling
// @access  Private

const getRecyclingRecords = async (req, res, next) => {
  try {
    const {
      wasteType,
      status,
      startDate,
      endDate,
    } = req.query;

    let query = {};


    if (wasteType && wasteType !== 'All') {
      query.wasteType = wasteType;
    }


    if (status && status !== 'All') {
      query.status = status;
    }


    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }


    const records = await RecyclingRecord.find(query)
      .sort({
        date: -1,
        createdAt: -1,
      });


    // =================================================
    // RECYCLING SUMMARY
    // =================================================

    const allRecords =
      await RecyclingRecord.find({});


    let totalRecycled = 0;
    let totalProcessing = 0;
    let totalRejected = 0;
    let totalReceived = 0;


    allRecords.forEach((rec) => {
      const qty = Number(rec.quantity || 0);

      if (rec.status === 'Received') {
        totalReceived += qty;
      }

      if (rec.status === 'Processing') {
        totalProcessing += qty;
      }

      if (rec.status === 'Recycled') {
        totalRecycled += qty;
      }

      if (rec.status === 'Rejected') {
        totalRejected += qty;
      }
    });


    // =================================================
    // WASTE INVENTORY
    // =================================================

    const wasteTypes = [
      'Plastic',
      'Paper',
      'Organic',
      'Glass',
      'Metal',
      'E-Waste',
      'Mixed Waste',
    ];


    const inventory = [];


    for (const type of wasteTypes) {
      const stock = await getWasteStock(type);

      inventory.push({
        wasteType: type,
        collected: stock.collected,
        used: stock.used,
        available: stock.available,
      });
    }


    // Total actual employee-collected waste
    const allCollected =
      await Collection.find({
        collected: true,
      });


    const totalCollectedWaste =
      allCollected.reduce(
        (total, record) =>
          total + Number(record.quantity || 0),
        0
      );


    const recyclingRate =
      totalCollectedWaste > 0
        ? (
            (totalRecycled /
              totalCollectedWaste) *
            100
          ).toFixed(1)
        : 0;


    res.json({
      success: true,

      count: records.length,

      summary: {
        totalReceived: Number(
          totalReceived.toFixed(1)
        ),

        totalCollectedWaste: Number(
          totalCollectedWaste.toFixed(1)
        ),

        totalRecycled: Number(
          totalRecycled.toFixed(1)
        ),

        totalProcessing: Number(
          totalProcessing.toFixed(1)
        ),

        totalRejected: Number(
          totalRejected.toFixed(1)
        ),

        recyclingRate: Number(
          recyclingRate
        ),

        inventory,
      },

      data: records,
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// CREATE RECYCLING RECORD
// =====================================================

// @desc    Create a recycling record
// @route   POST /api/recycling
// @access  Private (Admin)

const createRecyclingRecord = async (
  req,
  res,
  next
) => {
  try {
    const {
      wasteType,
      quantity,
      method,
      status,
      notes,
      date,
      unit = 'kg',
    } = req.body;


    if (
      !wasteType ||
      quantity === undefined ||
      !method
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide waste type, quantity, and method',
      });
    }


    const numericQuantity = Number(quantity);


    if (
      Number.isNaN(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Quantity must be greater than 0 kg',
      });
    }


    const finalStatus =
      status || 'Received';


    // =================================================
    // CHECK AVAILABLE STOCK
    // =================================================

    if (
      ['Received', 'Processing', 'Recycled']
        .includes(finalStatus)
    ) {
      const stock =
        await getWasteStock(wasteType);


      if (numericQuantity > stock.available) {
        return res.status(400).json({
          success: false,

          message:
            `Insufficient ${wasteType} stock. ` +
            `Only ${stock.available} kg is available ` +
            `for recycling/processing.`,
          
          stock: {
            wasteType,
            collected: stock.collected,
            used: stock.used,
            available: stock.available,
            requested: numericQuantity,
          },
        });
      }
    }


    const recordId =
      await generateRecordId();


    const record =
      await RecyclingRecord.create({
        recordId,

        wasteType: wasteType.trim(),

        quantity: numericQuantity,

        unit,

        method: method.trim(),

        status: finalStatus,

        notes: notes
          ? notes.trim()
          : '',

        date: date || new Date(),
      });


    res.status(201).json({
      success: true,

      message:
        'Recycling record logged successfully',

      data: record,
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// UPDATE RECYCLING RECORD
// =====================================================

// @desc    Update a recycling record
// @route   PUT /api/recycling/:id
// @access  Private (Admin)

const updateRecyclingRecord = async (
  req,
  res,
  next
) => {
  try {
    const record =
      await RecyclingRecord.findById(
        req.params.id
      );


    if (!record) {
      return res.status(404).json({
        success: false,
        message:
          'Recycling record not found',
      });
    }


    const {
      wasteType,
      quantity,
      method,
      status,
      notes,
      date,
    } = req.body;


    const newWasteType =
      wasteType !== undefined
        ? wasteType.trim()
        : record.wasteType;


    const newQuantity =
      quantity !== undefined
        ? Number(quantity)
        : record.quantity;


    const newStatus =
      status || record.status;


    if (
      Number.isNaN(newQuantity) ||
      newQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Quantity must be greater than 0 kg',
      });
    }


    // =================================================
    // CHECK STOCK
    // =================================================

    if (
      ['Received', 'Processing', 'Recycled']
        .includes(newStatus)
    ) {
      const stock =
        await getWasteStock(
          newWasteType,
          record._id
        );


      if (newQuantity > stock.available) {
        return res.status(400).json({
          success: false,

          message:
            `Insufficient ${newWasteType} stock. ` +
            `Only ${stock.available} kg is available ` +
            `for this recycling batch.`,

          stock: {
            wasteType: newWasteType,
            collected: stock.collected,
            used: stock.used,
            available: stock.available,
            requested: newQuantity,
          },
        });
      }
    }


    record.wasteType =
      newWasteType;

    record.quantity =
      newQuantity;

    record.method =
      method !== undefined
        ? method.trim()
        : record.method;

    record.status =
      newStatus;

    record.notes =
      notes !== undefined
        ? notes.trim()
        : record.notes;

    record.date =
      date || record.date;


    const updatedRecord =
      await record.save();


    res.json({
      success: true,

      message:
        'Recycling record updated successfully',

      data: updatedRecord,
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// DELETE RECYCLING RECORD
// =====================================================

// @desc    Delete a recycling record
// @route   DELETE /api/recycling/:id
// @access  Private (Admin)

const deleteRecyclingRecord = async (
  req,
  res,
  next
) => {
  try {
    const record =
      await RecyclingRecord.findById(
        req.params.id
      );


    if (!record) {
      return res.status(404).json({
        success: false,
        message:
          'Recycling record not found',
      });
    }


    await record.deleteOne();


    res.json({
      success: true,

      message:
        'Recycling record removed successfully',
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET INVENTORY ONLY
// =====================================================

// @desc    Get current waste inventory
// @route   GET /api/recycling/inventory
// @access  Private (Admin)

const getWasteInventory = async (
  req,
  res,
  next
) => {
  try {
    const wasteTypes = [
      'Plastic',
      'Paper',
      'Organic',
      'Glass',
      'Metal',
      'E-Waste',
      'Mixed Waste',
    ];


    const inventory = [];


    for (const type of wasteTypes) {
      const stock =
        await getWasteStock(type);


      inventory.push({
        wasteType: type,

        collected:
          stock.collected,

        used:
          stock.used,

        available:
          stock.available,
      });
    }


    res.json({
      success: true,
      data: inventory,
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  getRecyclingRecords,
  createRecyclingRecord,
  updateRecyclingRecord,
  deleteRecyclingRecord,
  getWasteInventory,
};