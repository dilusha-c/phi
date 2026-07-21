const DengueCase = require("../models/DengueCase");
const { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } = require("../constants/caseConstants");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilters = (filters = {}) => {
  const match = {};

  if (filters.currentStatus) {
    match.currentStatus = filters.currentStatus;
  }

  if (filters.severity) {
    match.severity = filters.severity;
  }

  if (filters.hospital) {
    match.hospital = { $regex: escapeRegex(filters.hospital), $options: "i" };
  }

  if (filters.district) {
    match["location.district"] = { $regex: escapeRegex(filters.district), $options: "i" };
  }

  if (filters.mohArea) {
    match["location.mohArea"] = { $regex: escapeRegex(filters.mohArea), $options: "i" };
  }

  if (filters.from || filters.to) {
    match.diagnosisDate = {};
    if (filters.from) {
      match.diagnosisDate.$gte = new Date(filters.from);
    }
    if (filters.to) {
      match.diagnosisDate.$lte = new Date(filters.to);
    }
  }

  if (filters.search) {
    const escapedSearch = escapeRegex(filters.search);
    match.$or = [
      { caseId: { $regex: escapedSearch, $options: "i" } },
      { hospital: { $regex: escapedSearch, $options: "i" } },
      { "location.address": { $regex: escapedSearch, $options: "i" } },
      { "location.district": { $regex: escapedSearch, $options: "i" } },
      { "location.mohArea": { $regex: escapedSearch, $options: "i" } },
      { "patient.firstName": { $regex: escapedSearch, $options: "i" } },
      { "patient.lastName": { $regex: escapedSearch, $options: "i" } },
      { "patient.nic": { $regex: escapedSearch, $options: "i" } },
    ];
  }

  return match;
};

const getBasePipeline = () => [
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

const getMapCases = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const match = buildFilters(filters);

  const pipeline = getBasePipeline();

  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
  }

  const [countResult, cases] = await Promise.all([
    DengueCase.aggregate([...pipeline, { $count: "totalRecords" }]),
    DengueCase.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
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

const getMapCaseById = async (id) => {
  return DengueCase.findById(id).populate("patient");
};

const getHotspots = async (filters = {}) => {
  const match = buildFilters(filters);
  const pipeline = getBasePipeline();

  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
  }

  pipeline.push(
    {
      $match: {
        "location.coordinates.0": { $type: "number" },
        "location.coordinates.1": { $type: "number" },
      },
    },
    {
      $group: {
        _id: {
          district: { $ifNull: ["$location.district", "Unknown"] },
          mohArea: { $ifNull: ["$location.mohArea", "Unknown"] },
        },
        count: { $sum: 1 },
        cases: {
          $push: {
            id: "$_id",
            caseId: "$caseId",
            status: "$currentStatus",
            severity: "$severity",
            hospital: "$hospital",
            coordinates: "$location.coordinates",
            address: "$location.address",
            patientName: { $concat: ["$patient.firstName", " ", "$patient.lastName"] },
          },
        },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  );

  return DengueCase.aggregate(pipeline);
};

const getStatistics = async (filters = {}) => {
  const match = buildFilters(filters);
  const pipeline = getBasePipeline();

  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
  }

  pipeline.push(
    {
      $facet: {
        overview: [{ $count: "totalCases" }],
        statusBreakdown: [{ $group: { _id: "$currentStatus", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        severityBreakdown: [{ $group: { _id: "$severity", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        districtBreakdown: [
          {
            $group: {
              _id: { $ifNull: ["$location.district", "Unknown"] },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
      },
    }
  );

  const result = await DengueCase.aggregate(pipeline);
  const summary = result[0] || {};

  return {
    totalCases: summary.overview?.[0]?.totalCases || 0,
    statusBreakdown: summary.statusBreakdown || [],
    severityBreakdown: summary.severityBreakdown || [],
    districtBreakdown: summary.districtBreakdown || [],
  };
};

module.exports = {
  getMapCases,
  getMapCaseById,
  getHotspots,
  getStatistics,
};