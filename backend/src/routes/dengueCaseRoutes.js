const express = require("express");
const dengueCaseController = require("../controllers/dengueCaseController");
const validateRequest = require("../middlewares/validateRequest");
const {
  createCaseValidation,
  updateCaseValidation,
  listCaseValidation,
  caseIdValidation,
} = require("../validations/dengueCaseValidation");

const router = express.Router();

router.get("/", listCaseValidation, validateRequest, dengueCaseController.listCases);
router.post("/", createCaseValidation, validateRequest, dengueCaseController.createCase);
router.get("/:id", caseIdValidation, validateRequest, dengueCaseController.getCaseById);
router.put("/:id", updateCaseValidation, validateRequest, dengueCaseController.updateCase);
router.delete("/:id", caseIdValidation, validateRequest, dengueCaseController.deleteCase);

module.exports = router;
