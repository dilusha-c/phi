const express = require("express");
const mapController = require("../controllers/mapController");
const validateRequest = require("../middlewares/validateRequest");
const { mapCaseIdValidation, mapFiltersValidation } = require("../validations/mapValidation");

const router = express.Router();

router.get("/cases", mapFiltersValidation, validateRequest, mapController.listMapCases);
router.get("/case/:id", mapCaseIdValidation, validateRequest, mapController.getMapCaseById);
router.get("/hotspots", mapFiltersValidation, validateRequest, mapController.getHotspots);
router.get("/statistics", mapFiltersValidation, validateRequest, mapController.getStatistics);

module.exports = router;