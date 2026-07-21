const express = require("express");
const dailyActivityController = require("../controllers/dailyActivityController");
const validateRequest = require("../middlewares/validateRequest");
const { protect } = require("../middlewares/authMiddleware");
const {
  createDailyActivityValidation,
  listDailyActivitiesValidation,
  dailyActivityIdValidation,
} = require("../validations/dailyActivityValidation");

const router = express.Router();

router.use(protect);

router.get("/", listDailyActivitiesValidation, validateRequest, dailyActivityController.listDailyActivities);
router.post("/", createDailyActivityValidation, validateRequest, dailyActivityController.createDailyActivity);
router.get("/:id", dailyActivityIdValidation, validateRequest, dailyActivityController.getDailyActivityById);
router.put("/:id", dailyActivityIdValidation, createDailyActivityValidation, validateRequest, dailyActivityController.updateDailyActivity);

module.exports = router;
