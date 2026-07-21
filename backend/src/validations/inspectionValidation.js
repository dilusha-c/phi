const { body, param, query } = require("express-validator");
const { INSPECTION_BREEDING_PLACES, INSPECTION_STATUS } = require("../constants/inspectionConstants");

const inspectionIdValidation = [param("id").isMongoId().withMessage("Invalid inspection ID")];

const createInspectionValidation = [
  body("dengueCase").isMongoId().withMessage("Dengue case is required and must be valid"),
  body("phiOfficer").trim().notEmpty().withMessage("PHI officer is required"),
  body("inspectionDate").isISO8601().withMessage("Inspection date must be valid"),
  body("inspectionTime").trim().notEmpty().withMessage("Inspection time is required"),
  body("breedingPlaces").optional().custom((value) => {
    if (Array.isArray(value)) {
      const invalid = value.some((item) => !INSPECTION_BREEDING_PLACES.includes(item));
      if (invalid) {
        throw new Error(`Breeding place must be one of: ${INSPECTION_BREEDING_PLACES.join(", ")}`);
      }
      return true;
    }

    if (typeof value === "string" && value.trim()) {
      return true;
    }

    return true;
  }),
  body("larvaeFound").optional().isBoolean().withMessage("Larvae found must be true or false"),
  body("waterTank").optional().isBoolean().withMessage("Water tank must be true or false"),
  body("tyres").optional().isBoolean().withMessage("Tyres must be true or false"),
  body("flowerPots").optional().isBoolean().withMessage("Flower pots must be true or false"),
  body("constructionSite").optional().isBoolean().withMessage("Construction site must be true or false"),
  body("wasteCollection").optional().isBoolean().withMessage("Waste collection must be true or false"),
  body("latitude").optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
  body("longitude").optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
  body("notes").optional().isString().withMessage("Notes must be text"),
  body("nextInspectionDate").optional({ checkFalsy: true }).isISO8601().withMessage("Next inspection date must be valid"),
  body("currentStatus").optional({ checkFalsy: true }).isIn(INSPECTION_STATUS).withMessage(`Current status must be one of: ${INSPECTION_STATUS.join(", ")}`),
];

const updateInspectionValidation = [
  ...inspectionIdValidation,
  body("dengueCase").optional().isMongoId().withMessage("Dengue case must be valid"),
  body("phiOfficer").optional().trim().notEmpty().withMessage("PHI officer cannot be empty"),
  body("inspectionDate").optional().isISO8601().withMessage("Inspection date must be valid"),
  body("inspectionTime").optional().trim().notEmpty().withMessage("Inspection time cannot be empty"),
  body("breedingPlaces").optional().custom((value) => {
    if (Array.isArray(value)) {
      const invalid = value.some((item) => !INSPECTION_BREEDING_PLACES.includes(item));
      if (invalid) {
        throw new Error(`Breeding place must be one of: ${INSPECTION_BREEDING_PLACES.join(", ")}`);
      }
      return true;
    }

    if (typeof value === "string" && value.trim()) {
      return true;
    }

    return true;
  }),
  body("larvaeFound").optional().isBoolean().withMessage("Larvae found must be true or false"),
  body("waterTank").optional().isBoolean().withMessage("Water tank must be true or false"),
  body("tyres").optional().isBoolean().withMessage("Tyres must be true or false"),
  body("flowerPots").optional().isBoolean().withMessage("Flower pots must be true or false"),
  body("constructionSite").optional().isBoolean().withMessage("Construction site must be true or false"),
  body("wasteCollection").optional().isBoolean().withMessage("Waste collection must be true or false"),
  body("latitude").optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
  body("longitude").optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
  body("notes").optional().isString().withMessage("Notes must be text"),
  body("nextInspectionDate").optional({ checkFalsy: true }).isISO8601().withMessage("Next inspection date must be valid"),
  body("currentStatus").optional({ checkFalsy: true }).isIn(INSPECTION_STATUS).withMessage(`Current status must be one of: ${INSPECTION_STATUS.join(", ")}`),
];

const listInspectionValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("search").optional().trim().isLength({ min: 1, max: 100 }).withMessage("Search query is invalid"),
  query("dengueCase").optional().isMongoId().withMessage("Dengue case filter must be valid"),
  query("phiOfficer").optional().trim().isLength({ min: 1, max: 100 }).withMessage("PHI officer filter is invalid"),
  query("currentStatus").optional().isIn(INSPECTION_STATUS).withMessage(`Current status must be one of: ${INSPECTION_STATUS.join(", ")}`),
];

module.exports = {
  createInspectionValidation,
  updateInspectionValidation,
  listInspectionValidation,
  inspectionIdValidation,
};
