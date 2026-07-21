const express = require("express");
const inspectionController = require("../controllers/inspectionController");
const validateRequest = require("../middlewares/validateRequest");
const inspectionUpload = require("../middlewares/inspectionUpload");
const {
  createInspectionValidation,
  updateInspectionValidation,
  listInspectionValidation,
  inspectionIdValidation,
} = require("../validations/inspectionValidation");

const router = express.Router();

router.get("/", listInspectionValidation, validateRequest, inspectionController.listInspections);
router.post(
  "/",
  inspectionUpload.array("images", 10),
  createInspectionValidation,
  validateRequest,
  inspectionController.createInspection
);
router.get("/:id", inspectionIdValidation, validateRequest, inspectionController.getInspectionById);
router.put(
  "/:id",
  inspectionUpload.array("images", 10),
  updateInspectionValidation,
  validateRequest,
  inspectionController.updateInspection
);
router.delete("/:id", inspectionIdValidation, validateRequest, inspectionController.deleteInspection);

module.exports = router;
