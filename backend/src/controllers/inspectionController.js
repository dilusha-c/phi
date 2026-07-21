const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const inspectionService = require("../services/inspectionService");

const createInspection = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.createInspection(req.body, req.files || []);

  res.status(201).json(new ApiResponse(201, true, "Inspection created successfully", inspection));
});

const listInspections = asyncHandler(async (req, res) => {
  const result = await inspectionService.getInspections(req.query);

  res.status(200).json(
    new ApiResponse(200, true, "Inspections retrieved successfully", result.inspections, result.pagination)
  );
});

const getInspectionById = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.getInspectionById(req.params.id);

  if (!inspection) {
    return res.status(404).json({ success: false, message: "Inspection not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Inspection retrieved successfully", inspection));
});

const updateInspection = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.updateInspection(req.params.id, req.body, req.files || []);

  if (!inspection) {
    return res.status(404).json({ success: false, message: "Inspection not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Inspection updated successfully", inspection));
});

const deleteInspection = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.deleteInspection(req.params.id);

  if (!inspection) {
    return res.status(404).json({ success: false, message: "Inspection not found" });
  }

  res.status(200).json(new ApiResponse(200, true, "Inspection deleted successfully", inspection));
});

module.exports = {
  createInspection,
  listInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
};
