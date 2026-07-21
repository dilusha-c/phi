const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, nic, password, phoneNumber, role, phiId } = req.body;

  if (!name || !nic || !password || !phoneNumber || !role) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields (name, nic, password, phoneNumber, role)",
    });
  }

  if (!["SPHI", "PHI"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Only SPHI and PHI can be registered",
    });
  }

  const userExists = await User.findOne({ nic });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User with this NIC already registered",
    });
  }

  let assignedPhiId = undefined;
  if (role === "PHI") {
    assignedPhiId = phiId || `PHI-${nic}`;
    const phiIdExists = await User.findOne({ phiId: assignedPhiId });
    if (phiIdExists) {
      return res.status(400).json({
        success: false,
        message: "User with this PHI ID already registered",
      });
    }
  }

  const user = await User.create({
    name,
    nic,
    password,
    phoneNumber,
    role,
    phiId: assignedPhiId,
  });

  res.status(201).json(
    new ApiResponse(201, true, `${role} registered successfully`, {
      id: user._id,
      name: user.name,
      nic: user.nic,
      role: user.role,
      phiId: user.phiId,
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter username (NIC/Email) and password",
    });
  }

  let user;
  if (username.includes("@") || username === "phi123123@gmail.com") {
    user = await User.findOne({ email: username });
  } else {
    user = await User.findOne({ nic: username });
  }

  if (user && (await user.matchPassword(password))) {
    res.status(200).json(
      new ApiResponse(200, true, "Login successful", {
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          nic: user.nic,
          email: user.email,
          role: user.role,
          phiId: user.phiId,
          phoneNumber: user.phoneNumber,
        },
      })
    );
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, true, "User profile retrieved successfully", {
      id: req.user._id,
      name: req.user.name,
      nic: req.user.nic,
      email: req.user.email,
      role: req.user.role,
      phiId: req.user.phiId,
      phoneNumber: req.user.phoneNumber,
    })
  );
});

const getPhis = asyncHandler(async (req, res) => {
  const { name } = req.query;
  const query = { role: "PHI" };
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }
  const phis = await User.find(query).select("name phiId nic");
  res.status(200).json(
    new ApiResponse(200, true, "PHIs retrieved successfully", phis)
  );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const query = {};
  if (role) {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { nic: { $regex: search, $options: "i" } },
      { phiId: { $regex: search, $options: "i" } },
    ];
  }
  const users = await User.find(query).select("-password").sort({ createdAt: -1 });
  res.status(200).json(
    new ApiResponse(200, true, "Users retrieved successfully", users)
  );
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, nic, phoneNumber, role, phiId, password } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Prevent updating to a duplicated NIC
  if (nic && nic !== user.nic) {
    const nicExists = await User.findOne({ nic });
    if (nicExists) {
      return res.status(400).json({ success: false, message: "NIC already in use" });
    }
    user.nic = nic;
  }

  // Prevent duplicate phiId
  if (role === "PHI" || (!role && user.role === "PHI")) {
    const newPhiId = phiId || user.phiId;
    if (newPhiId && newPhiId !== user.phiId) {
      const phiExists = await User.findOne({ phiId: newPhiId });
      if (phiExists) {
        return res.status(400).json({ success: false, message: "PHI ID already in use" });
      }
    }
    user.phiId = newPhiId;
  } else if (role && role !== "PHI") {
    user.phiId = undefined;
  }

  user.name = name || user.name;
  user.phoneNumber = phoneNumber || user.phoneNumber;
  user.role = role || user.role;

  if (password) {
    user.password = password; // Will be hashed by pre-save hook
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(200, true, "User updated successfully", {
      id: user._id,
      name: user.name,
      nic: user.nic,
      role: user.role,
      phiId: user.phiId,
      phoneNumber: user.phoneNumber,
    })
  );
});

const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json(
    new ApiResponse(200, true, "User deleted successfully", null)
  );
});

module.exports = {
  register,
  login,
  getMe,
  getPhis,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
};
