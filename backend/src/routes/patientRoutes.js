const express = require("express");
const patientController = require("../controllers/patientController");
const validateRequest = require("../middlewares/validateRequest");
const {
  createPatientValidation,
  updatePatientValidation,
  listPatientsValidation,
  patientIdValidation,
} = require("../validations/patientValidation");

const router = express.Router();

router.get("/", listPatientsValidation, validateRequest, patientController.listPatients);
router.post("/", createPatientValidation, validateRequest, patientController.createPatient);
router.get("/:id", patientIdValidation, validateRequest, patientController.getPatientById);
router.put("/:id", updatePatientValidation, validateRequest, patientController.updatePatient);
router.delete("/:id", patientIdValidation, validateRequest, patientController.deletePatient);

module.exports = router;
