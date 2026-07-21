const DengueCase = require("../models/DengueCase");
const { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } = require("../constants/caseConstants");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateCaseId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const count = await DengueCase.countDocuments({
    caseId: new RegExp(`^CASE-${year}-`),
  });

  return `CASE-${year}-${String(count + 1).padStart(6, "0")}`;
};

const buildMatchStage = ({ patient, caseType, currentStatus, hospital, nic, name, search }) => {
  const match = {};

  if (patient) {
    match.patient = patient;
  }

  if (caseType) {
    match.caseType = caseType;
  }

  if (currentStatus) {
    match.currentStatus = currentStatus;
  }

  if (hospital) {
    match.hospital = { $regex: escapeRegex(hospital), $options: "i" };
  }

  const searchClauses = [];

  if (name) {
    searchClauses.push(
      { "patient.firstName": { $regex: escapeRegex(name), $options: "i" } },
      { "patient.lastName": { $regex: escapeRegex(name), $options: "i" } },
      { $expr: { $regexMatch: { input: { $concat: ["$patient.firstName", " ", "$patient.lastName"] }, regex: escapeRegex(name), options: "i" } } }
    );
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    searchClauses.push(
      { caseId: { $regex: escapedSearch, $options: "i" } },
      { hospital: { $regex: escapedSearch, $options: "i" } },
      { "patient.firstName": { $regex: escapedSearch, $options: "i" } },
      { "patient.lastName": { $regex: escapedSearch, $options: "i" } }
    );
  }

  if (searchClauses.length) {
    match.$or = searchClauses;
  }

  return match;
};

const normalizeSymptoms = (symptoms) => {
  if (Array.isArray(symptoms)) {
    return symptoms.map((symptom) => String(symptom).trim()).filter(Boolean);
  }

  if (typeof symptoms === "string" && symptoms.trim()) {
    return symptoms.split(",").map((symptom) => symptom.trim()).filter(Boolean);
  }

  return [];
};

const sanitizePayload = (payload = {}) => ({
  patient: payload.patient,
  diagnosisDate: payload.diagnosisDate,
  hospital: payload.hospital,
  hospitalRegistrationNumber: payload.hospitalRegistrationNumber,
  caseType: payload.caseType,
  severity: payload.severity,
  symptoms: normalizeSymptoms(payload.symptoms),
  plateletCount: payload.plateletCount === "" || payload.plateletCount === undefined ? null : payload.plateletCount,
  bloodTestResult: payload.bloodTestResult,
  dateSymptomsStarted: payload.dateSymptomsStarted || null,
  admissionDate: payload.admissionDate || null,
  dischargeDate: payload.dischargeDate || null,
  currentStatus: payload.currentStatus || "Active",
  notes: payload.notes || "",
  location:
    payload.locationLatitude && payload.locationLongitude
      ? {
          type: "Point",
          coordinates: [Number(payload.locationLongitude), Number(payload.locationLatitude)],
          address: payload.locationAddress || "",
          district: payload.locationDistrict || "",
          mohArea: payload.locationMohArea || "",
          source: payload.locationSource || "manual",
          capturedAt: payload.locationCapturedAt || new Date(),
        }
      : undefined,
});

const createCase = async (payload) => {
  const caseId = await generateCaseId();
  return DengueCase.create({
    ...sanitizePayload(payload),
    caseId,
  });
};

const getCases = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const matchStage = buildMatchStage(filters);
  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $lookup: {
        from: "patients",
        localField: "patient",
        foreignField: "_id",
        as: "patient",
      },
    },
    {
      $unwind: "$patient",
    },
  ];

  if (Object.keys(matchStage).length) {
    pipeline.push({ $match: matchStage });
  }

  const [countResult, cases] = await Promise.all([
    DengueCase.aggregate([...pipeline, { $count: "totalRecords" }]),
    DengueCase.aggregate([...pipeline, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }]),
  ]);

  const totalRecords = countResult[0]?.totalRecords || 0;

  return {
    cases,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit) || 1,
    },
  };
};

const getCaseById = async (id) => {
  return DengueCase.findById(id).populate("patient");
};

const updateCase = async (id, payload) => {
  const caseRecord = await DengueCase.findById(id);

  if (!caseRecord) {
    return null;
  }

  Object.assign(caseRecord, sanitizePayload(payload));
  await caseRecord.save();
  return caseRecord.populate("patient");
};

const deleteCase = async (id) => {
  return DengueCase.findByIdAndDelete(id);
};

module.exports = {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
};
