const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const dengueCaseService = require("../services/dengueCaseService");

const createCase = asyncHandler(async (req, res) => {
  const caseRecord = await dengueCaseService.createCase(req.body);

  res.status(201).json(new ApiResponse(201, true, "Dengue case created successfully", caseRecord));
});

const listCases = asyncHandler(async (req, res) => {
  const result = await dengueCaseService.getCases(req.query);

  res.status(200).json(
    new ApiResponse(200, true, "Cases retrieved successfully", result.cases, result.pagination)
  );
});

const getCaseById = asyncHandler(async (req, res) => {
  const caseRecord = await dengueCaseService.getCaseById(req.params.id);

  if (!caseRecord) {
    return res.status(404).json({ success: false, message: "Case not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Case retrieved successfully", caseRecord));
});

const updateCase = asyncHandler(async (req, res) => {
  const caseRecord = await dengueCaseService.updateCase(req.params.id, req.body);

  if (!caseRecord) {
    return res.status(404).json({ success: false, message: "Case not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Case updated successfully", caseRecord));
});

const deleteCase = asyncHandler(async (req, res) => {
  const caseRecord = await dengueCaseService.deleteCase(req.params.id);

  if (!caseRecord) {
    return res.status(404).json({ success: false, message: "Case not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Case deleted successfully", caseRecord));
});

module.exports = {
  createCase,
  listCases,
  getCaseById,
  updateCase,
  deleteCase,
};
