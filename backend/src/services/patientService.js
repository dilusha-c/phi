const Patient = require("../models/Patient");
const { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } = require("../constants/patientConstants");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generatePatientId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const count = await Patient.countDocuments({
    patientId: new RegExp(`^PAT-${year}-`),
  });

  return `PAT-${year}-${String(count + 1).padStart(6, "0")}`;
};

const buildFilters = ({ dengueSourcePlaceType, name }) => {
  const filters = {};

  if (dengueSourcePlaceType) {
    filters.dengueSourcePlaceType = dengueSourcePlaceType;
  }

  if (name) {
    filters.$or = [
      { firstName: { $regex: escapeRegex(name), $options: "i" } },
      { lastName: { $regex: escapeRegex(name), $options: "i" } },
    ];
  }

  return filters;
};

const sanitizePatientPayload = (payload = {}) => ({
  firstName: payload.firstName,
  lastName: payload.lastName,
  gender: payload.gender,
  dengueSourcePlaceType: payload.dengueSourcePlaceType,
  dengueSourcePlace: payload.dengueSourcePlace,
  address: payload.address,
  province: payload.province,
  district: payload.district,
  mohArea: payload.mohArea,
  gnDivision: payload.gnDivision,
  registrationDate: payload.registrationDate || undefined,
});

const createPatient = async (payload) => {
  const patientId = await generatePatientId();
  const patient = await Patient.create({
    ...sanitizePatientPayload(payload),
    patientId,
  });

  return patient;
};

const getPatients = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const queryFilters = buildFilters(filters);
  const skip = (page - 1) * limit;

  const [patients, totalRecords] = await Promise.all([
    Patient.find(queryFilters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Patient.countDocuments(queryFilters),
  ]);

  return {
    patients,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit) || 1,
    },
  };
};

const getPatientById = async (id) => {
  return Patient.findById(id);
};

const updatePatient = async (id, payload) => {
  const patient = await Patient.findById(id);

  if (!patient) {
    return null;
  }

  Object.assign(patient, sanitizePatientPayload(payload));
  await patient.save();
  return patient;
};

const deletePatient = async (id) => {
  return Patient.findByIdAndDelete(id);
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
