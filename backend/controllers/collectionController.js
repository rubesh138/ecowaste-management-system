const Collection = require('../models/Collection');


// =====================================================
// EMPLOYEE - CREATE COLLECTION
// =====================================================

const createCollection = async (req, res) => {
  try {
    const {
      collectionType,
      locationName,
      wasteType,
      quantity,
      collectionDate,
      collected,
      remarks,
    } = req.body;

    if (
      !collectionType ||
      !locationName ||
      !wasteType ||
      !collectionDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Collection type, location, waste type and collection date are required',
      });
    }

    const collectedQuantity = Number(quantity || 0);

    if (Number.isNaN(collectedQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number',
      });
    }

    if (collected && collectedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message:
          'Collected quantity must be greater than 0 kg',
      });
    }

    const collection = await Collection.create({
      employee: req.user._id,

      collectionType,

      locationName: locationName.trim(),

      wasteType: wasteType.trim(),

      quantity: collected
        ? collectedQuantity
        : 0,

      collectionDate,

      collected: collected !== false,

      remarks: remarks
        ? remarks.trim()
        : '',
    });

    const populatedCollection =
      await Collection.findById(
        collection._id
      ).populate(
        'employee',
        'name email phone'
      );

    res.status(201).json({
      success: true,

      message:
        'Collection record created successfully',

      data: populatedCollection,
    });
  } catch (error) {
    console.error(
      'Create collection error:',
      error
    );

    res.status(500).json({
      success: false,

      message:
        'Failed to create collection record',

      error: error.message,
    });
  }
};


// =====================================================
// EMPLOYEE - GET MY COLLECTIONS
// =====================================================

const getMyCollections = async (
  req,
  res
) => {
  try {
    const collections =
      await Collection.find({
        employee: req.user._id,
      })
        .populate(
          'employee',
          'name email phone'
        )
        .sort({
          collectionDate: -1,
          createdAt: -1,
        });

    res.json({
      success: true,

      count: collections.length,

      data: collections,
    });
  } catch (error) {
    console.error(
      'Get my collections error:',
      error
    );

    res.status(500).json({
      success: false,

      message:
        'Failed to fetch collection records',

      error: error.message,
    });
  }
};


// =====================================================
// ADMIN - GET ALL COLLECTIONS
// =====================================================

const getAllCollections = async (
  req,
  res
) => {
  try {
    const collections =
      await Collection.find()
        .populate(
          'employee',
          'name email phone address role status'
        )
        .sort({
          collectionDate: -1,
          createdAt: -1,
        });

    res.json({
      success: true,

      count: collections.length,

      data: collections,
    });
  } catch (error) {
    console.error(
      'Get all collections error:',
      error
    );

    res.status(500).json({
      success: false,

      message:
        'Failed to fetch all collection records',

      error: error.message,
    });
  }
};


// =====================================================
// ADMIN - GET SINGLE COLLECTION
// =====================================================

const getCollectionById = async (
  req,
  res
) => {
  try {
    const collection =
      await Collection.findById(
        req.params.id
      ).populate(
        'employee',
        'name email phone address role status'
      );

    if (!collection) {
      return res.status(404).json({
        success: false,

        message:
          'Collection record not found',
      });
    }

    res.json({
      success: true,

      data: collection,
    });
  } catch (error) {
    console.error(
      'Get collection by ID error:',
      error
    );

    res.status(500).json({
      success: false,

      message:
        'Failed to fetch collection record',

      error: error.message,
    });
  }
};


// =====================================================
// ADMIN - UPDATE COLLECTION
// =====================================================

const updateCollection = async (
  req,
  res
) => {
  try {
    const {
      collectionType,
      locationName,
      wasteType,
      quantity,
      collectionDate,
      collected,
      remarks,
    } = req.body;

    const collection =
      await Collection.findById(
        req.params.id
      );

    if (!collection) {
      return res.status(404).json({
        success: false,

        message:
          'Collection record not found',
      });
    }


    // -----------------------------------------------
    // Collection Type
    // -----------------------------------------------

    if (collectionType !== undefined) {
      const validTypes = [
        'house',
        'industry',
        'village',
      ];

      if (
        !validTypes.includes(
          collectionType
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            'Invalid collection type',
        });
      }

      collection.collectionType =
        collectionType;
    }


    // -----------------------------------------------
    // Location
    // -----------------------------------------------

    if (locationName !== undefined) {
      if (!String(locationName).trim()) {
        return res.status(400).json({
          success: false,

          message:
            'Location cannot be empty',
        });
      }

      collection.locationName =
        String(locationName).trim();
    }


    // -----------------------------------------------
    // Waste Type
    // -----------------------------------------------

    if (wasteType !== undefined) {
      if (!String(wasteType).trim()) {
        return res.status(400).json({
          success: false,

          message:
            'Waste type cannot be empty',
        });
      }

      collection.wasteType =
        String(wasteType).trim();
    }


    // -----------------------------------------------
    // Quantity
    // -----------------------------------------------

    if (quantity !== undefined) {
      const newQuantity =
        Number(quantity);

      if (
        Number.isNaN(newQuantity) ||
        newQuantity < 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            'Quantity must be a valid number greater than or equal to 0',
        });
      }

      collection.quantity =
        newQuantity;
    }


    // -----------------------------------------------
    // Collected Status
    // -----------------------------------------------

    if (collected !== undefined) {
      collection.collected =
        Boolean(collected);

      // If not collected, quantity must be 0
      if (!collection.collected) {
        collection.quantity = 0;
      }

      // If changing to collected,
      // quantity must be greater than 0
      if (
        collection.collected &&
        Number(collection.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            'Collected quantity must be greater than 0 kg',
        });
      }
    }


    // -----------------------------------------------
    // Collection Date
    // -----------------------------------------------

    if (collectionDate !== undefined) {
      if (!collectionDate) {
        return res.status(400).json({
          success: false,

          message:
            'Collection date cannot be empty',
        });
      }

      collection.collectionDate =
        collectionDate;
    }


    // -----------------------------------------------
    // Remarks
    // -----------------------------------------------

    if (remarks !== undefined) {
      collection.remarks =
        remarks
          ? String(remarks).trim()
          : '';
    }


    await collection.save();


    const updatedCollection =
      await Collection.findById(
        collection._id
      ).populate(
        'employee',
        'name email phone address role status'
      );

    res.json({
      success: true,

      message:
        'Collection record updated successfully',

      data: updatedCollection,
    });
  } catch (error) {
    console.error(
      'Update collection error:',
      error
    );

    res.status(500).json({
      success: false,

      message:
        'Failed to update collection record',

      error: error.message,
    });
  }
};


// =====================================================
// ADMIN - DELETE COLLECTION
// =====================================================

const deleteCollection = async (
  req,
  res
) => {
  try {
    const collection =
      await Collection.findById(
        req.params.id
      );

    if (!collection) {
      return res.status(404).json({
        success: false,

        message:
          'Collection record not found',
      });
    }

    await Collection.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,

      message:
        'Collection record deleted successfully',
    });
  } catch (error) {
    console.error(
      'Delete collection error:',
      error
    );

    res.status(500).json({
      success: false,

      message:
        'Failed to delete collection record',

      error: error.message,
    });
  }
};


// =====================================================
// ADMIN - COLLECTION SUMMARY
// =====================================================

const getCollectionSummary = async (
  req,
  res
) => {
  try {
    const summary =
      await Collection.aggregate([
        {
          $match: {
            collected: true,
          },
        },

        {
          $group: {
            _id: '$employee',

            totalQuantity: {
              $sum: '$quantity',
            },

            totalCollections: {
              $sum: 1,
            },
          },
        },

        {
          $lookup: {
            from: 'users',

            localField: '_id',

            foreignField: '_id',

            as: 'employee',
          },
        },

        {
          $unwind: {
            path: '$employee',

            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $project: {
            _id: 1,

            employeeName:
              '$employee.name',

            employeeEmail:
              '$employee.email',

            employeePhone:
              '$employee.phone',

            totalQuantity: 1,

            totalCollections: 1,
          },
        },

        {
          $sort: {
            totalQuantity: -1,
          },
        },
      ]);


    // =================================================
    // OVERALL COLLECTION TOTAL
    // =================================================

    const overallResult =
      await Collection.aggregate([
        {
          $match: {
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


    const overall =
      overallResult[0] || {
        totalQuantity: 0,

        totalCollections: 0,
      };


    res.json({
      success: true,

      data: {
        employees: summary,

        overall: {
          totalQuantity:
            overall.totalQuantity,

          totalCollections:
            overall.totalCollections,
        },
      },
    });
  } catch (error) {
    console.error(
      'Collection summary error:',
      error
    );

    res.status(500).json({
      success: false,

      message:
        'Failed to generate collection summary',

      error: error.message,
    });
  }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createCollection,
  getMyCollections,
  getAllCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  getCollectionSummary,
};