const { body, param, query } = require("express-validator");
const { FOLLOW_UP_VISIT_TYPES, FOLLOW_UP_STATUS } = require("../constants/followUpConstants");

const followUpIdValidation = [param("id").isMongoId().withMessage("Invalid follow-up ID")];

const createFollowUpValidation = [
  body("dengueCase").isMongoId().withMessage("Dengue case is required and must be valid"),
  body("patient").isMongoId().withMessage("Patient is required and must be valid"),
  body("followUpDate").isISO8601().withMessage("Follow-up date must be valid"),
  body("followUpTime").trim().notEmpty().withMessage("Follow-up time is required"),
  body("phiOfficer").trim().notEmpty().withMessage("PHI officer is required"),
  body("visitType").isIn(FOLLOW_UP_VISIT_TYPES).withMessage(`Visit type must be one of: ${FOLLOW_UP_VISIT_TYPES.join(", ")}`),
  body("patientCondition").trim().notEmpty().withMessage("Patient condition is required"),
  body("temperature").optional({ checkFalsy: true }).isFloat({ min: 30, max: 45 }).withMessage("Temperature must be between 30 and 45"),
  body("plateletCount").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Platelet count must be a non-negative number"),
  body("symptoms").optional().custom((value) => Array.isArray(value) || typeof value === "string").withMessage("Symptoms must be a list or comma separated string"),
  body("breedingSitesChecked").optional().custom((value) => Array.isArray(value) || typeof value === "string").withMessage("Breeding sites checked must be a list or comma separated string"),
  body("larvaeFound").optional().isBoolean().withMessage("Larvae found must be true or false"),
  body("treatmentProgress").optional().isString().withMessage("Treatment progress must be text"),
  body("notes").optional().isString().withMessage("Notes must be text"),
  body("nextFollowUpDate").optional({ checkFalsy: true }).isISO8601().withMessage("Next follow-up date must be valid"),
  body("status").optional({ checkFalsy: true }).isIn(FOLLOW_UP_STATUS).withMessage(`Status must be one of: ${FOLLOW_UP_STATUS.join(", ")}`),
];

const updateFollowUpValidation = [
  ...followUpIdValidation,
  body("dengueCase").optional().isMongoId().withMessage("Dengue case must be valid"),
  body("patient").optional().isMongoId().withMessage("Patient must be valid"),
  body("followUpDate").optional().isISO8601().withMessage("Follow-up date must be valid"),
  body("followUpTime").optional().trim().notEmpty().withMessage("Follow-up time cannot be empty"),
  body("phiOfficer").optional().trim().notEmpty().withMessage("PHI officer cannot be empty"),
  body("visitType").optional().isIn(FOLLOW_UP_VISIT_TYPES).withMessage(`Visit type must be one of: ${FOLLOW_UP_VISIT_TYPES.join(", ")}`),
  body("patientCondition").optional().trim().notEmpty().withMessage("Patient condition cannot be empty"),
  body("temperature").optional({ checkFalsy: true }).isFloat({ min: 30, max: 45 }).withMessage("Temperature must be between 30 and 45"),
  body("plateletCount").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Platelet count must be a non-negative number"),
  body("symptoms").optional().custom((value) => Array.isArray(value) || typeof value === "string").withMessage("Symptoms must be a list or comma separated string"),
  body("breedingSitesChecked").optional().custom((value) => Array.isArray(value) || typeof value === "string").withMessage("Breeding sites checked must be a list or comma separated string"),
  body("larvaeFound").optional().isBoolean().withMessage("Larvae found must be true or false"),
  body("treatmentProgress").optional().isString().withMessage("Treatment progress must be text"),
  body("notes").optional().isString().withMessage("Notes must be text"),
  body("nextFollowUpDate").optional({ checkFalsy: true }).isISO8601().withMessage("Next follow-up date must be valid"),
  body("status").optional({ checkFalsy: true }).isIn(FOLLOW_UP_STATUS).withMessage(`Status must be one of: ${FOLLOW_UP_STATUS.join(", ")}`),
];

const listFollowUpValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("search").optional().trim().isLength({ min: 1, max: 100 }).withMessage("Search query is invalid"),
  query("dengueCase").optional().isMongoId().withMessage("Dengue case filter must be valid"),
  query("patient").optional().isMongoId().withMessage("Patient filter must be valid"),
  query("phiOfficer").optional().trim().isLength({ min: 1, max: 100 }).withMessage("PHI officer filter is invalid"),
  query("status").optional().isIn(FOLLOW_UP_STATUS).withMessage(`Status must be one of: ${FOLLOW_UP_STATUS.join(", ")}`),
];

module.exports = {
  createFollowUpValidation,
  updateFollowUpValidation,
  listFollowUpValidation,
  followUpIdValidation,
};
