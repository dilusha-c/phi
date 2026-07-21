const FollowUp = require("../models/FollowUp");
const { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } = require("../constants/followUpConstants");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateFollowUpId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const count = await FollowUp.countDocuments({
    followUpId: new RegExp(`^FU-${year}-`),
  });

  return `FU-${year}-${String(count + 1).padStart(6, "0")}`;
};

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
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
  patient: payload.patient,
  followUpDate: payload.followUpDate,
  followUpTime: payload.followUpTime,
  phiOfficer: payload.phiOfficer,
  visitType: payload.visitType,
  patientCondition: payload.patientCondition,
  temperature: payload.temperature === "" || payload.temperature === undefined ? null : payload.temperature,
  plateletCount: payload.plateletCount === "" || payload.plateletCount === undefined ? null : payload.plateletCount,
  symptoms: normalizeList(payload.symptoms),
  breedingSitesChecked: normalizeList(payload.breedingSitesChecked),
  larvaeFound: parseBoolean(payload.larvaeFound),
  treatmentProgress: payload.treatmentProgress || "",
  notes: payload.notes || "",
  nextFollowUpDate: payload.nextFollowUpDate || null,
  status: payload.status || "Pending",
});

const buildMatchStage = ({ search, dengueCase, patient, phiOfficer, status }) => {
  const match = {};

  if (dengueCase) {
    match["dengueCase._id"] = dengueCase;
  }

  if (patient) {
    match["patient._id"] = patient;
  }

  if (phiOfficer) {
    match.phiOfficer = { $regex: escapeRegex(phiOfficer), $options: "i" };
  }

  if (status) {
    match.status = status;
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    match.$or = [
      { followUpId: { $regex: escapedSearch, $options: "i" } },
      { phiOfficer: { $regex: escapedSearch, $options: "i" } },
      { patientCondition: { $regex: escapedSearch, $options: "i" } },
      { notes: { $regex: escapedSearch, $options: "i" } },
      { "dengueCase.caseId": { $regex: escapedSearch, $options: "i" } },
      { "patient.patientId": { $regex: escapedSearch, $options: "i" } },
      { "patient.firstName": { $regex: escapedSearch, $options: "i" } },
      { "patient.lastName": { $regex: escapedSearch, $options: "i" } },
    ];
  }

  return match;
};

const createFollowUp = async (payload) => {
  const followUpId = await generateFollowUpId();
  return FollowUp.create({
    ...normalizePayload(payload),
    followUpId,
  });
};

const getFollowUps = async (filters = {}) => {
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
        as: "dengueCase",
      },
    },
    { $unwind: "$dengueCase" },
    {
      $lookup: {
        from: "patients",
        localField: "patient",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: "$patient" },
  ];

  if (Object.keys(matchStage).length) {
    basePipeline.push({ $match: matchStage });
  }

  const [countResult, followUps] = await Promise.all([
    FollowUp.aggregate([...basePipeline, { $count: "totalRecords" }]),
    FollowUp.aggregate([...basePipeline, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }]),
  ]);

  const totalRecords = countResult[0]?.totalRecords || 0;

  return {
    followUps,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit) || 1,
    },
  };
};

const getFollowUpById = async (id) => {
  return FollowUp.findById(id).populate("dengueCase").populate("patient");
};

const updateFollowUp = async (id, payload) => {
  const followUp = await FollowUp.findById(id);

  if (!followUp) {
    return null;
  }

  Object.assign(followUp, normalizePayload(payload));
  await followUp.save();
  return followUp.populate("dengueCase").populate("patient");
};

const deleteFollowUp = async (id) => {
  return FollowUp.findByIdAndDelete(id);
};

module.exports = {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
};
