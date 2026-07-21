const { body, param, query } = require("express-validator");
const { PATIENT_GENDERS, DENGUE_SOURCE_PLACE_TYPES } = require("../constants/patientConstants");

const patientIdValidation = [param("id").isMongoId().withMessage("Invalid patient ID")];

const createPatientValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required").isLength({ max: 100 }).withMessage("First name must be 100 characters or less"),
  body("lastName").trim().notEmpty().withMessage("Last name is required").isLength({ max: 100 }).withMessage("Last name must be 100 characters or less"),
  body("gender").isIn(PATIENT_GENDERS).withMessage(`Gender must be one of: ${PATIENT_GENDERS.join(", ")}`),
  body("dengueSourcePlaceType").isIn(DENGUE_SOURCE_PLACE_TYPES).withMessage(`Dengue source place type must be one of: ${DENGUE_SOURCE_PLACE_TYPES.join(", ")}`),
  body("dengueSourcePlace").trim().notEmpty().withMessage("Dengue source place is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("province").trim().notEmpty().withMessage("Province is required"),
  body("district").trim().notEmpty().withMessage("District is required"),
  body("mohArea").trim().notEmpty().withMessage("MOH area is required"),
  body("gnDivision").trim().notEmpty().withMessage("GN division is required"),
  body("registrationDate").optional({ checkFalsy: true }).isISO8601().withMessage("Registration date must be valid"),
];

const updatePatientValidation = [
  ...patientIdValidation,
  body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty").isLength({ max: 100 }).withMessage("First name must be 100 characters or less"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty").isLength({ max: 100 }).withMessage("Last name must be 100 characters or less"),
  body("gender").optional().isIn(PATIENT_GENDERS).withMessage(`Gender must be one of: ${PATIENT_GENDERS.join(", ")}`),
  body("dengueSourcePlaceType").optional().isIn(DENGUE_SOURCE_PLACE_TYPES).withMessage(`Dengue source place type must be one of: ${DENGUE_SOURCE_PLACE_TYPES.join(", ")}`),
  body("dengueSourcePlace").optional().trim().notEmpty().withMessage("Dengue source place cannot be empty"),
  body("address").optional().trim().notEmpty().withMessage("Address cannot be empty"),
  body("province").optional().trim().notEmpty().withMessage("Province cannot be empty"),
  body("district").optional().trim().notEmpty().withMessage("District cannot be empty"),
  body("mohArea").optional().trim().notEmpty().withMessage("MOH area cannot be empty"),
  body("gnDivision").optional().trim().notEmpty().withMessage("GN division cannot be empty"),
  body("registrationDate").optional({ checkFalsy: true }).isISO8601().withMessage("Registration date must be valid"),
];

const listPatientsValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 2000 }).withMessage("Limit must be between 1 and 2000"),
  query("name").optional().trim().isLength({ min: 1, max: 100 }).withMessage("Name filter is invalid"),
  query("dengueSourcePlaceType").optional().isIn(DENGUE_SOURCE_PLACE_TYPES).withMessage(`Dengue source place type filter must be one of: ${DENGUE_SOURCE_PLACE_TYPES.join(", ")}`),
];

module.exports = {
  createPatientValidation,
  updatePatientValidation,
  listPatientsValidation,
  patientIdValidation,
};
