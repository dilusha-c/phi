const express = require("express");
const router = express.Router();
const { register, login, getMe, getPhis, getAllUsers, updateUserByAdmin, deleteUserByAdmin } = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/phis", protect, getPhis);

router.get("/users", protect, authorize("Admin"), getAllUsers);
router.put("/users/:id", protect, authorize("Admin"), updateUserByAdmin);
router.delete("/users/:id", protect, authorize("Admin"), deleteUserByAdmin);

module.exports = router;
