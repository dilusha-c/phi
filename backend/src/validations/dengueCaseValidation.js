const { body, param, query } = require("express-validator");
const { CASE_TYPES, CASE_SEVERITIES, CASE_STATUSES } = require("../constants/caseConstants");

const caseIdValidation = [param("id").isMongoId().withMessage("Invalid case ID")];

const createCaseValidation = [
  body("patient").isMongoId().withMessage("Patient is required and must be valid"),
  body("diagnosisDate").isISO8601().withMessage("Diagnosis date must be valid"),
  body("hospital").trim().notEmpty().withMessage("Hospital is required"),
  body("hospitalRegistrationNumber").trim().notEmpty().withMessage("Hospital registration number is required"),
  body("caseType").isIn(CASE_TYPES).withMessage(`Case type must be one of: ${CASE_TYPES.join(", ")}`),
  body("severity").isIn(CASE_SEVERITIES).withMessage(`Severity must be one of: ${CASE_SEVERITIES.join(", ")}`),
  body("symptoms").optional().isArray().withMessage("Symptoms must be an array"),
  body("symptoms.*").optional().isString().trim().notEmpty().withMessage("Each symptom must be a non-empty string"),
  body("plateletCount").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Platelet count must be a non-negative number"),
  body("bloodTestResult").trim().notEmpty().withMessage("Blood test result is required"),
  body("dateSymptomsStarted").optional({ checkFalsy: true }).isISO8601().withMessage("Date symptoms started must be valid"),
  body("admissionDate").optional({ checkFalsy: true }).isISO8601().withMessage("Admission date must be valid"),
  body("dischargeDate").optional({ checkFalsy: true }).isISO8601().withMessage("Discharge date must be valid"),
  body("currentStatus").optional({ checkFalsy: true }).isIn(CASE_STATUSES).withMessage(`Current status must be one of: ${CASE_STATUSES.join(", ")}`),
  body("notes").optional({ checkFalsy: true }).isString().withMessage("Notes must be text"),
  body("locationLatitude").optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).withMessage("Location latitude must be a valid coordinate"),
  body("locationLongitude").optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }).withMessage("Location longitude must be a valid coordinate"),
  body("locationAddress").optional({ checkFalsy: true }).isString().withMessage("Location address must be text"),
  body("locationDistrict").optional({ checkFalsy: true }).isString().withMessage("Location district must be text"),
  body("locationMohArea").optional({ checkFalsy: true }).isString().withMessage("Location MOH area must be text"),
  body("locationSource").optional({ checkFalsy: true }).isIn(["manual", "gps", "search"]).withMessage("Location source must be one of: manual, gps, search"),
];

const updateCaseValidation = [
  ...caseIdValidation,
  body("patient").optional().isMongoId().withMessage("Patient must be valid"),
  body("diagnosisDate").optional().isISO8601().withMessage("Diagnosis date must be valid"),
  body("hospital").optional().trim().notEmpty().withMessage("Hospital cannot be empty"),
  body("hospitalRegistrationNumber").optional().trim().notEmpty().withMessage("Hospital registration number cannot be empty"),
  body("caseType").optional().isIn(CASE_TYPES).withMessage(`Case type must be one of: ${CASE_TYPES.join(", ")}`),
  body("severity").optional().isIn(CASE_SEVERITIES).withMessage(`Severity must be one of: ${CASE_SEVERITIES.join(", ")}`),
  body("symptoms").optional().isArray().withMessage("Symptoms must be an array"),
  body("symptoms.*").optional().isString().trim().notEmpty().withMessage("Each symptom must be a non-empty string"),
  body("plateletCount").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Platelet count must be a non-negative number"),
  body("bloodTestResult").optional().trim().notEmpty().withMessage("Blood test result cannot be empty"),
  body("dateSymptomsStarted").optional({ checkFalsy: true }).isISO8601().withMessage("Date symptoms started must be valid"),
  body("admissionDate").optional({ checkFalsy: true }).isISO8601().withMessage("Admission date must be valid"),
  body("dischargeDate").optional({ checkFalsy: true }).isISO8601().withMessage("Discharge date must be valid"),
  body("currentStatus").optional({ checkFalsy: true }).isIn(CASE_STATUSES).withMessage(`Current status must be one of: ${CASE_STATUSES.join(", ")}`),
  body("notes").optional({ checkFalsy: true }).isString().withMessage("Notes must be text"),
  body("locationLatitude").optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).withMessage("Location latitude must be a valid coordinate"),
  body("locationLongitude").optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }).withMessage("Location longitude must be a valid coordinate"),
  body("locationAddress").optional({ checkFalsy: true }).isString().withMessage("Location address must be text"),
  body("locationDistrict").optional({ checkFalsy: true }).isString().withMessage("Location district must be text"),
  body("locationMohArea").optional({ checkFalsy: true }).isString().withMessage("Location MOH area must be text"),
  body("locationSource").optional({ checkFalsy: true }).isIn(["manual", "gps", "search"]).withMessage("Location source must be one of: manual, gps, search"),
];

const listCaseValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("patient").optional().isMongoId().withMessage("Patient filter must be valid"),
  query("caseType").optional().isIn(CASE_TYPES).withMessage(`Case type must be one of: ${CASE_TYPES.join(", ")}`),
  query("currentStatus").optional().isIn(CASE_STATUSES).withMessage(`Current status must be one of: ${CASE_STATUSES.join(", ")}`),
  query("hospital").optional().trim().isLength({ min: 1, max: 200 }).withMessage("Hospital filter is invalid"),
  query("name").optional().trim().isLength({ min: 1, max: 100 }).withMessage("Name filter is invalid"),
];

module.exports = {
  createCaseValidation,
  updateCaseValidation,
  listCaseValidation,
  caseIdValidation,
};
