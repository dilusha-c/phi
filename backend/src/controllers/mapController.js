const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const mapService = require("../services/mapService");

const listMapCases = asyncHandler(async (req, res) => {
  const result = await mapService.getMapCases(req.query);
  res.status(200).json(new ApiResponse(200, true, "Map cases retrieved successfully", result.cases, result.pagination));
});

const getMapCaseById = asyncHandler(async (req, res) => {
  const caseRecord = await mapService.getMapCaseById(req.params.id);

  if (!caseRecord) {
    return res.status(404).json({ success: false, message: "Case not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Map case retrieved successfully", caseRecord));
});

const getHotspots = asyncHandler(async (req, res) => {
  const hotspots = await mapService.getHotspots(req.query);
  res.status(200).json(new ApiResponse(200, true, "Hotspots retrieved successfully", hotspots));
});

const getStatistics = asyncHandler(async (req, res) => {
  const statistics = await mapService.getStatistics(req.query);
  res.status(200).json(new ApiResponse(200, true, "Map statistics retrieved successfully", statistics));
});

module.exports = {
  listMapCases,
  getMapCaseById,
  getHotspots,
  getStatistics,
};