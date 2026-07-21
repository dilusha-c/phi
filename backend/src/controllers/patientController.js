const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const patientService = require("../services/patientService");

const createPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.createPatient(req.body);

  res.status(201).json(
    new ApiResponse(201, true, "Patient registered successfully", patient)
  );
});

const listPatients = asyncHandler(async (req, res) => {
  const result = await patientService.getPatients(req.query);

  res.status(200).json(
    new ApiResponse(200, true, "Patients retrieved successfully", result.patients, result.pagination)
  );
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  res.status(200).json(new ApiResponse(200, true, "Patient retrieved successfully", patient));
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.body);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  res.status(200).json(new ApiResponse(200, true, "Patient updated successfully", patient));
});

const deletePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.deletePatient(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  res.status(200).json(new ApiResponse(200, true, "Patient deleted successfully", patient));
});

module.exports = {
  createPatient,
  listPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
