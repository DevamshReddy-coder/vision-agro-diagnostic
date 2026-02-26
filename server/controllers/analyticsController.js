const Diagnosis = require('../models/Diagnosis');

// @desc Get analytics overview
exports.getOverview = async (req, res) => {
  try {
    const stats = await Diagnosis.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          byDisease: [
            { $group: { _id: "$disease", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ],
          bySeverity: [
            { $group: { _id: "$severity", count: { $sum: 1 } } }
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $project: { disease: 1, confidence: 1, severity: 1, createdAt: 1 } }
          ]
        }
      }
    ]);

    res.json({
      total: stats[0].total[0]?.count || 0,
      byDisease: stats[0].byDisease,
      bySeverity: stats[0].bySeverity,
      recent: stats[0].recent
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
