const User = require('../models/User');
const WasteRequest = require('../models/WasteRequest');
const Complaint = require('../models/Complaint');
const RecyclingRecord = require('../models/RecyclingRecord');

// ============================================================
// DATE FILTER
// Today       = today 00:00 -> now
// This Week   = Monday -> now
// This Month  = 1st day of current month -> now
// This Year   = Jan 1 current year -> now
// All Time    = no date filter
// ============================================================

const getDateFilter = (timeframe) => {
  const now = new Date();

  let startDate = null;

  switch (timeframe) {
    case 'today': {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    }

    case 'week': {
      startDate = new Date(now);

      const day = startDate.getDay();

      // Sunday = 0, Monday = 1
      const daysFromMonday = day === 0 ? 6 : day - 1;

      startDate.setDate(startDate.getDate() - daysFromMonday);
      startDate.setHours(0, 0, 0, 0);

      break;
    }

    case 'month': {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0
      );

      break;
    }

    case 'year': {
      startDate = new Date(
        now.getFullYear(),
        0,
        1,
        0,
        0,
        0,
        0
      );

      break;
    }

    case 'all':
    default:
      return null;
  }

  return {
    $gte: startDate,
    $lte: now,
  };
};

// ============================================================
// DASHBOARD SUMMARY
// ============================================================

const getDashboardSummary = async (req, res, next) => {
  try {
    const isCitizen = req.user.role === 'citizen';

    const { timeframe = 'all' } = req.query;

    const dateFilter = getDateFilter(timeframe);

    // --------------------------------------------------------
    // CITIZEN SUMMARY
    // --------------------------------------------------------

    if (isCitizen) {
      const citizenId = req.user._id;

      const requestQuery = {
        citizen: citizenId,
      };

      const complaintQuery = {
        citizen: citizenId,
      };

      if (dateFilter) {
        requestQuery.createdAt = dateFilter;
        complaintQuery.createdAt = dateFilter;
      }

      const totalRequests =
        await WasteRequest.countDocuments(requestQuery);

      const pendingRequests =
        await WasteRequest.countDocuments({
          ...requestQuery,
          status: {
            $in: ['Pending', 'Under Review'],
          },
        });

      const acceptedRequests =
        await WasteRequest.countDocuments({
          ...requestQuery,
          status: 'Accepted',
        });

      const scheduledRequests =
        await WasteRequest.countDocuments({
          ...requestQuery,
          status: 'Scheduled',
        });

      const completedRequests =
        await WasteRequest.countDocuments({
          ...requestQuery,
          status: 'Completed',
        });

      const totalComplaints =
        await Complaint.countDocuments(complaintQuery);

      const completedList =
        await WasteRequest.find({
          ...requestQuery,
          status: {
            $in: ['Collected', 'Completed'],
          },
        });

      const totalWasteKg = completedList.reduce(
        (total, item) =>
          total + Number(item.quantityValue || 0),
        0
      );

      return res.json({
        success: true,
        data: {
          totalRequests,
          pending: pendingRequests,
          accepted: acceptedRequests,
          scheduled: scheduledRequests,
          completed: completedRequests,
          complaints: totalComplaints,
          totalWasteKg: Number(totalWasteKg.toFixed(1)),
        },
      });
    }

    // --------------------------------------------------------
    // ADMIN SUMMARY
    // --------------------------------------------------------

    const totalCitizens =
      await User.countDocuments({
        role: 'citizen',
      });

    const requestBaseQuery = {};

    const complaintBaseQuery = {};

    if (dateFilter) {
      requestBaseQuery.createdAt = dateFilter;
      complaintBaseQuery.createdAt = dateFilter;
    }

    const totalRequests =
      await WasteRequest.countDocuments(requestBaseQuery);

    const newRequests =
      await WasteRequest.countDocuments({
        ...requestBaseQuery,
        status: 'Pending',
      });

    const underReviewRequests =
      await WasteRequest.countDocuments({
        ...requestBaseQuery,
        status: 'Under Review',
      });

    const acceptedRequests =
      await WasteRequest.countDocuments({
        ...requestBaseQuery,
        status: 'Accepted',
      });

    const scheduledCollections =
      await WasteRequest.countDocuments({
        ...requestBaseQuery,
        status: 'Scheduled',
      });

    const collectedCollections =
      await WasteRequest.countDocuments({
        ...requestBaseQuery,
        status: 'Collected',
      });

    const completedCollections =
      await WasteRequest.countDocuments({
        ...requestBaseQuery,
        status: 'Completed',
      });

    const rejectedRequests =
      await WasteRequest.countDocuments({
        ...requestBaseQuery,
        status: 'Rejected',
      });

    // --------------------------------------------------------
    // COMPLAINTS
    // --------------------------------------------------------

    const pendingComplaints =
      await Complaint.countDocuments({
        ...complaintBaseQuery,
        status: {
          $in: ['Pending', 'In Progress'],
        },
      });

    const resolvedComplaints =
      await Complaint.countDocuments({
        ...complaintBaseQuery,
        status: 'Resolved',
      });

    // --------------------------------------------------------
    // RECYCLING
    // --------------------------------------------------------

    const recyclingQuery = {};

    if (dateFilter) {
      recyclingQuery.createdAt = dateFilter;
    }

    const recyclingRecords =
      await RecyclingRecord.find(recyclingQuery);

    let totalRecycledKg = 0;
    let totalWasteReceivedKg = 0;

    recyclingRecords.forEach((record) => {
      const quantity = Number(record.quantity || 0);

      totalWasteReceivedKg += quantity;

      if (record.status === 'Recycled') {
        totalRecycledKg += quantity;
      }
    });

    // --------------------------------------------------------
    // COLLECTED WASTE
    // --------------------------------------------------------

    const completedRequestQuery = {
      ...requestBaseQuery,
      status: {
        $in: ['Collected', 'Completed'],
      },
    };

    const allCompletedRequests =
      await WasteRequest.find(completedRequestQuery);

    const totalCollectedWasteKg =
      allCompletedRequests.reduce(
        (total, item) =>
          total + Number(item.quantityValue || 0),
        0
      );

    // --------------------------------------------------------
    // RECYCLING RATE
    // --------------------------------------------------------

    const effectiveTotalWaste =
      Math.max(
        totalWasteReceivedKg,
        totalCollectedWasteKg
      );

    const recyclingRate =
      effectiveTotalWaste > 0
        ? (totalRecycledKg / effectiveTotalWaste) * 100
        : 0;

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    res.json({
      success: true,
      data: {
        totalCitizens,

        totalRequests,

        newRequests,

        pendingRequests:
          newRequests + underReviewRequests,

        acceptedRequests,

        scheduledCollections,

        collectedCollections,

        completedCollections,

        rejectedRequests,

        pendingComplaints,

        resolvedComplaints,

        totalRecycledWaste:
          Number(totalRecycledKg.toFixed(1)),

        totalWasteCollected:
          Number(totalCollectedWasteKg.toFixed(1)),

        recyclingRate:
          Number(recyclingRate.toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// REQUEST ANALYTICS
// ============================================================

const getRequestsAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'all' } = req.query;

    const dateFilter = getDateFilter(timeframe);

    const matchStage = {};

    if (dateFilter) {
      matchStage.createdAt = dateFilter;
    }

    // --------------------------------------------------------
    // STATUS DISTRIBUTION
    // --------------------------------------------------------

    const statusCounts =
      await WasteRequest.aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: '$status',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);

    const statusColors = {
      Pending: '#F59E0B',
      'Under Review': '#3B82F6',
      Accepted: '#10B981',
      Scheduled: '#8B5CF6',
      Collected: '#06B6D4',
      Completed: '#059669',
      Rejected: '#EF4444',
    };

    const statusDistribution =
      statusCounts.map((item) => ({
        name: item._id,
        value: item.count,
        color:
          statusColors[item._id] ||
          '#6B7280',
      }));

    // --------------------------------------------------------
    // COLLECTION TREND
    // --------------------------------------------------------

    const recentRequests =
      await WasteRequest.find(matchStage)
        .sort({
          createdAt: 1,
        });

    const trendMap = {};

    recentRequests.forEach((request) => {
      const date = new Date(request.createdAt);

      const dateStr =
        date.toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
          }
        );

      if (!trendMap[dateStr]) {
        trendMap[dateStr] = {
          date: dateStr,
          submitted: 0,
          completed: 0,
          weight: 0,
        };
      }

      trendMap[dateStr].submitted += 1;

      if (
        ['Collected', 'Completed'].includes(
          request.status
        )
      ) {
        trendMap[dateStr].completed += 1;

        trendMap[dateStr].weight +=
          Number(request.quantityValue || 0);
      }
    });

    const collectionTrend =
      Object.values(trendMap);

    res.json({
      success: true,
      data: {
        statusDistribution,
        collectionTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// WASTE ANALYTICS
// ============================================================

const getWasteAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'all' } = req.query;

    const dateFilter = getDateFilter(timeframe);

    const matchStage = {};

    if (dateFilter) {
      matchStage.createdAt = dateFilter;
    }

    // --------------------------------------------------------
    // WASTE BY TYPE
    // --------------------------------------------------------

    const wasteByType =
      await WasteRequest.aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: '$wasteType',

            count: {
              $sum: 1,
            },

            totalQuantityKg: {
              $sum: {
                $ifNull: [
                  '$quantityValue',
                  0,
                ],
              },
            },
          },
        },
        {
          $sort: {
            totalQuantityKg: -1,
          },
        },
      ]);

    const wasteTypeData =
      wasteByType.map((item) => ({
        name: item._id || 'Unknown',
        count: item.count,
        totalKg: Number(
          (item.totalQuantityKg || 0).toFixed(1)
        ),
      }));

    // --------------------------------------------------------
    // TREND
    // --------------------------------------------------------

    let monthlyData;

    // For Today / Week / Month:
    // show the actual dates in the selected period.
    if (
      timeframe === 'today' ||
      timeframe === 'week' ||
      timeframe === 'month'
    ) {
      monthlyData =
        await WasteRequest.aggregate([
          {
            $match: matchStage,
          },
          {
            $group: {
              _id: {
                year: {
                  $year: '$createdAt',
                },
                month: {
                  $month: '$createdAt',
                },
                day: {
                  $dayOfMonth: '$createdAt',
                },
              },

              requests: {
                $sum: 1,
              },

              completed: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        '$status',
                        [
                          'Collected',
                          'Completed',
                        ],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              totalKg: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        '$status',
                        [
                          'Collected',
                          'Completed',
                        ],
                      ],
                    },
                    {
                      $ifNull: [
                        '$quantityValue',
                        0,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
          {
            $sort: {
              '_id.year': 1,
              '_id.month': 1,
              '_id.day': 1,
            },
          },
        ]);

    } else {
      // For Year / All Time:
      // show monthly aggregation.
      monthlyData =
        await WasteRequest.aggregate([
          {
            $match: matchStage,
          },
          {
            $group: {
              _id: {
                year: {
                  $year: '$createdAt',
                },
                month: {
                  $month: '$createdAt',
                },
              },

              requests: {
                $sum: 1,
              },

              completed: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        '$status',
                        [
                          'Collected',
                          'Completed',
                        ],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              totalKg: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        '$status',
                        [
                          'Collected',
                          'Completed',
                        ],
                      ],
                    },
                    {
                      $ifNull: [
                        '$quantityValue',
                        0,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
          {
            $sort: {
              '_id.year': 1,
              '_id.month': 1,
            },
          },
        ]);
    }

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let monthlyTrend;

    if (
      timeframe === 'today' ||
      timeframe === 'week' ||
      timeframe === 'month'
    ) {
      monthlyTrend =
        monthlyData.map((item) => ({
          month:
            `${monthNames[item._id.month - 1]} ${item._id.day}`,

          requests: item.requests,

          completed: item.completed,

          volumeKg: Number(
            (item.totalKg || 0).toFixed(1)
          ),
        }));
    } else {
      monthlyTrend =
        monthlyData.map((item) => ({
          month:
            `${monthNames[item._id.month - 1]} ${item._id.year}`,

          requests: item.requests,

          completed: item.completed,

          volumeKg: Number(
            (item.totalKg || 0).toFixed(1)
          ),
        }));
    }

    res.json({
      success: true,
      data: {
        wasteTypeData,
        monthlyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// RECYCLING ANALYTICS
// ============================================================

const getRecyclingAnalytics = async (
  req,
  res,
  next
) => {
  try {
    const { timeframe = 'all' } = req.query;

    const dateFilter =
      getDateFilter(timeframe);

    const query = {};

    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    const records =
      await RecyclingRecord.find(query);

    const methodMap = {};
    const wasteTypeMap = {};

    let totalRecycledKg = 0;
    let totalProcessingKg = 0;

    records.forEach((record) => {
      const quantity =
        Number(record.quantity || 0);

      // Method breakdown
      if (!methodMap[record.method]) {
        methodMap[record.method] = 0;
      }

      methodMap[record.method] += quantity;

      // Waste type breakdown
      if (!wasteTypeMap[record.wasteType]) {
        wasteTypeMap[record.wasteType] = 0;
      }

      wasteTypeMap[record.wasteType] += quantity;

      // Status totals
      if (record.status === 'Recycled') {
        totalRecycledKg += quantity;
      }

      if (record.status === 'Processing') {
        totalProcessingKg += quantity;
      }
    });

    const methodBreakdown =
      Object.keys(methodMap).map(
        (method) => ({
          method,

          quantityKg: Number(
            methodMap[method].toFixed(1)
          ),
        })
      );

    const typeBreakdown =
      Object.keys(wasteTypeMap).map(
        (wasteType) => ({
          wasteType,

          quantityKg: Number(
            wasteTypeMap[wasteType].toFixed(1)
          ),
        })
      );

    res.json({
      success: true,
      data: {
        totalRecycledKg:
          Number(totalRecycledKg.toFixed(1)),

        totalProcessingKg:
          Number(totalProcessingKg.toFixed(1)),

        methodBreakdown,

        typeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getDashboardSummary,
  getRequestsAnalytics,
  getWasteAnalytics,
  getRecyclingAnalytics,
};