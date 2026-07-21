const { body, query } = require("express-validator");

const createDailyActivityValidation = [
  body("phiId").trim().notEmpty().withMessage("PHI ID is required"),
  body("date").trim().notEmpty().withMessage("Date is required").isISO8601().withMessage("Must be a valid date"),
  body("activities").isArray({ min: 1 }).withMessage("Activities must be an array with at least one item"),
  body("activities.*.activityType")
    .isIn(["Dengue Patients Home Visit", "Field Visit", "Source Check", "Other"])
    .withMessage("Invalid activity type"),
  body("activities.*.customActivityType").custom((value, { req, path }) => {
    // Retrieve index of activity from path (e.g. activities[0].customActivityType)
    const match = path.match(/\d+/);
    if (match) {
      const idx = parseInt(match[0], 10);
      const activity = req.body.activities[idx];
      if (activity && activity.activityType === "Other" && (!value || value.trim() === "")) {
        throw new Error("Custom activity description is required when 'Other' is selected");
      }
    }
    return true;
  }),
  body("activities.*.location").custom((value) => {
    const hasName = value && typeof value.name === "string" && value.name.trim() !== "";
    const hasCoords =
      value &&
      Array.isArray(value.coordinates) &&
      value.coordinates.length === 2 &&
      typeof value.coordinates[0] === "number" &&
      typeof value.coordinates[1] === "number";
    if (!hasName && !hasCoords) {
      throw new Error("Each activity must have either a map location or a typed location name.");
    }
    return true;
  }),
];

const listDailyActivitiesValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 2000 }).withMessage("Limit must be between 1 and 2000"),
  query("phiId").optional().trim(),
  query("phiName").optional().trim(),
  query("date").optional().trim().isISO8601().withMessage("Date must be a valid ISO8601 date"),
  query("startDate").optional().trim().isISO8601().withMessage("Start date must be a valid ISO8601 date"),
  query("endDate").optional().trim().isISO8601().withMessage("End date must be a valid ISO8601 date"),
];

const { param } = require("express-validator");

const dailyActivityIdValidation = [
  param("id").isMongoId().withMessage("Invalid daily activity log ID")
];

module.exports = {
  createDailyActivityValidation,
  listDailyActivitiesValidation,
  dailyActivityIdValidation,
};
