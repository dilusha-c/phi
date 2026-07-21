const { body, param, query } = require("express-validator");
const { CASE_STATUSES, CASE_SEVERITIES } = require("../constants/caseConstants");

const mapCaseIdValidation = [param("id").isMongoId().withMessage("Invalid case ID")];

const mapFiltersValidation = [
  query("page").optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional({ checkFalsy: true }).isInt({ min: 1, max: 2000 }).withMessage("Limit must be between 1 and 2000"),
  query("currentStatus").optional({ checkFalsy: true }).isIn(CASE_STATUSES).withMessage(`Status must be one of: ${CASE_STATUSES.join(", ")}`),
  query("severity").optional({ checkFalsy: true }).isIn(CASE_SEVERITIES).withMessage(`Severity must be one of: ${CASE_SEVERITIES.join(", ")}`),
  query("district").optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 120 }).withMessage("District filter is invalid"),
  query("mohArea").optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 120 }).withMessage("MOH area filter is invalid"),
  query("hospital").optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 200 }).withMessage("Hospital filter is invalid"),
  query("search").optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 200 }).withMessage("Search filter is invalid"),
  query("from").optional({ checkFalsy: true }).isISO8601().withMessage("From date must be valid"),
  query("to").optional({ checkFalsy: true }).isISO8601().withMessage("To date must be valid"),
];

const mapLookupValidation = [
  ...mapCaseIdValidation,
  body("district").optional().trim().isLength({ min: 1, max: 120 }).withMessage("District must be valid"),
  body("mohArea").optional().trim().isLength({ min: 1, max: 120 }).withMessage("MOH area must be valid"),
];

module.exports = {
  mapCaseIdValidation,
  mapFiltersValidation,
  mapLookupValidation,
};