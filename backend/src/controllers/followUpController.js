const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const followUpService = require("../services/followUpService");

const createFollowUp = asyncHandler(async (req, res) => {
  const followUp = await followUpService.createFollowUp(req.body);
  res.status(201).json(new ApiResponse(201, true, "Follow-up created successfully", followUp));
});

const listFollowUps = asyncHandler(async (req, res) => {
  const result = await followUpService.getFollowUps(req.query);
  res.status(200).json(new ApiResponse(200, true, "Follow-ups retrieved successfully", result.followUps, result.pagination));
});

const getFollowUpById = asyncHandler(async (req, res) => {
  const followUp = await followUpService.getFollowUpById(req.params.id);

  if (!followUp) {
    return res.status(404).json({ success: false, message: "Follow-up not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Follow-up retrieved successfully", followUp));
});

const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await followUpService.updateFollowUp(req.params.id, req.body);

  if (!followUp) {
    return res.status(404).json({ success: false, message: "Follow-up not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Follow-up updated successfully", followUp));
});

const deleteFollowUp = asyncHandler(async (req, res) => {
  const followUp = await followUpService.deleteFollowUp(req.params.id);

  if (!followUp) {
    return res.status(404).json({ success: false, message: "Follow-up not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Follow-up deleted successfully", followUp));
});

module.exports = {
  createFollowUp,
  listFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
};
