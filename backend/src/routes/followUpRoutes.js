const express = require("express");
const followUpController = require("../controllers/followUpController");
const validateRequest = require("../middlewares/validateRequest");
const {
  createFollowUpValidation,
  updateFollowUpValidation,
  listFollowUpValidation,
  followUpIdValidation,
} = require("../validations/followUpValidation");

const router = express.Router();

router.get("/", listFollowUpValidation, validateRequest, followUpController.listFollowUps);
router.post("/", createFollowUpValidation, validateRequest, followUpController.createFollowUp);
router.get("/:id", followUpIdValidation, validateRequest, followUpController.getFollowUpById);
router.put("/:id", updateFollowUpValidation, validateRequest, followUpController.updateFollowUp);
router.delete("/:id", followUpIdValidation, validateRequest, followUpController.deleteFollowUp);

module.exports = router;
