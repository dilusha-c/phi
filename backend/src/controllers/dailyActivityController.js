const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const dailyActivityService = require("../services/dailyActivityService");

const createDailyActivity = asyncHandler(async (req, res) => {
  if (req.user.role === "PHI") {
    req.body.phiId = req.user.phiId;
  }
  const dailyActivity = await dailyActivityService.createDailyActivity(req.body);

  res.status(201).json(
    new ApiResponse(201, true, "Daily activity log registered successfully", dailyActivity)
  );
});

const listDailyActivities = asyncHandler(async (req, res) => {
  if (req.user.role === "PHI") {
    req.query.phiId = req.user.phiId;
  }
  const result = await dailyActivityService.getDailyActivities(req.query);

  res.status(200).json(
    new ApiResponse(200, true, "Daily activity logs retrieved successfully", result.activities, result.pagination)
  );
});

const getDailyActivityById = asyncHandler(async (req, res) => {
  const dailyActivity = await dailyActivityService.getDailyActivityById(req.params.id);

  if (!dailyActivity) {
    return res.status(404).json({
      success: false,
      message: "Daily activity log not found",
    });
  }

  if (req.user.role === "PHI" && dailyActivity.phiId !== req.user.phiId) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to view this daily activity log.",
    });
  }

  res.status(200).json(new ApiResponse(200, true, "Daily activity log retrieved successfully", dailyActivity));
});

const updateDailyActivity = asyncHandler(async (req, res) => {
  const existing = await dailyActivityService.getDailyActivityById(req.params.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Daily activity log not found",
    });
  }

  if (req.user.role === "PHI" && existing.phiId !== req.user.phiId) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not authorized to edit this daily activity log.",
    });
  }

  if (req.user.role === "PHI") {
    req.body.phiId = req.user.phiId;
  }

  const dailyActivity = await dailyActivityService.updateDailyActivity(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, true, "Daily activity log updated successfully", dailyActivity));
});

module.exports = {
  createDailyActivity,
  listDailyActivities,
  getDailyActivityById,
  updateDailyActivity,
};
