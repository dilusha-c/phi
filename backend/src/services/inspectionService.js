const mongoose = require("mongoose");
const Inspection = require("../models/Inspection");
const { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } = require("../constants/inspectionConstants");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateInspectionId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const count = await Inspection.countDocuments({
    inspectionId: new RegExp(`^INSP-${year}-`),
  });

  return `INSP-${year}-${String(count + 1).padStart(6, "0")}`;
};

const parseBoolean = (value) => {
  if (value === true || value === false) {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return Boolean(value);
};

const normalizePayload = (payload = {}) => ({
  dengueCase: payload.dengueCase,
  phiOfficer: payload.phiOfficer,
  inspectionDate: payload.inspectionDate,
  inspectionTime: payload.inspectionTime,
  breedingPlaces: Array.isArray(payload.breedingPlaces)
    ? payload.breedingPlaces
    : typeof payload.breedingPlaces === "string" && payload.breedingPlaces.trim()
      ? payload.breedingPlaces.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
  larvaeFound: parseBoolean(payload.larvaeFound),
  waterTank: parseBoolean(payload.waterTank),
  tyres: parseBoolean(payload.tyres),
  flowerPots: parseBoolean(payload.flowerPots),
  constructionSite: parseBoolean(payload.constructionSite),
  wasteCollection: parseBoolean(payload.wasteCollection),
  gpsCoordinates: {
    latitude: payload.latitude === "" || payload.latitude === undefined ? null : payload.latitude,
    longitude: payload.longitude === "" || payload.longitude === undefined ? null : payload.longitude,
  },
  notes: payload.notes || "",
  nextInspectionDate: payload.nextInspectionDate || null,
  currentStatus: payload.currentStatus || "Pending",
});

const mapImages = (files = [], existingImages = []) => {
  const uploadedImages = files.map((file) => `/uploads/${file.filename}`);
  return [...existingImages, ...uploadedImages];
};

const buildMatchStage = ({ search, dengueCase, phiOfficer, currentStatus }) => {
  const match = {};

  if (dengueCase) {
    match["dengueCase._id"] = new mongoose.Types.ObjectId(dengueCase);
  }

  if (phiOfficer) {
    match.phiOfficer = { $regex: escapeRegex(phiOfficer), $options: "i" };
  }

  if (currentStatus) {
    match.currentStatus = currentStatus;
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    match.$or = [
      { inspectionId: { $regex: escapedSearch, $options: "i" } },
      { phiOfficer: { $regex: escapedSearch, $options: "i" } },
      { notes: { $regex: escapedSearch, $options: "i" } },
      { "dengueCase.caseId": { $regex: escapedSearch, $options: "i" } },
      { "dengueCase.patient.patientId": { $regex: escapedSearch, $options: "i" } },
      { "dengueCase.patient.firstName": { $regex: escapedSearch, $options: "i" } },
      { "dengueCase.patient.lastName": { $regex: escapedSearch, $options: "i" } },
    ];
  }

  return match;
};

const createInspection = async (payload, files = []) => {
  const inspectionId = await generateInspectionId();
  return Inspection.create({
    ...normalizePayload(payload),
    images: mapImages(files),
    inspectionId,
  });
};

const getInspections = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const matchStage = buildMatchStage(filters);

  const basePipeline = [
    {
      $lookup: {
        from: "denguecases",
        localField: "dengueCase",
        foreignField: "_id",
        as: "dengueCaseDoc",
      },
    },
    {
      $unwind: "$dengueCaseDoc",
    },
    {
      $lookup: {
        from: "patients",
        localField: "dengueCaseDoc.patient",
        foreignField: "_id",
        as: "patientDoc",
      },
    },
    {
      $unwind: "$patientDoc",
    },
    {
      $set: {
        "dengueCaseDoc.patient": "$patientDoc",
      },
    },
    {
      $unset: "patientDoc",
    },
    {
      $set: {
        dengueCase: "$dengueCaseDoc",
      },
    },
    {
      $unset: "dengueCaseDoc",
    },
  ];

  if (Object.keys(matchStage).length) {
    basePipeline.push({ $match: matchStage });
  }

  const [countResult, inspections] = await Promise.all([
    Inspection.aggregate([...basePipeline, { $count: "totalRecords" }]),
    Inspection.aggregate([...basePipeline, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }]),
  ]);

  const totalRecords = countResult[0]?.totalRecords || 0;

  return {
    inspections,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit) || 1,
    },
  };
};

const getInspectionById = async (id) => {
  return Inspection.findById(id).populate({
    path: "dengueCase",
    populate: {
      path: "patient",
    },
  });
};

const updateInspection = async (id, payload, files = []) => {
  const inspection = await Inspection.findById(id);

  if (!inspection) {
    return null;
  }

  const normalizedPayload = normalizePayload(payload);
  Object.assign(inspection, normalizedPayload);

  if (files.length > 0) {
    inspection.images = mapImages(files, inspection.images || []);
  }

  await inspection.save();
  return inspection.populate({
    path: "dengueCase",
    populate: {
      path: "patient",
    },
  });
};

const deleteInspection = async (id) => {
  return Inspection.findByIdAndDelete(id);
};

module.exports = {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
};
