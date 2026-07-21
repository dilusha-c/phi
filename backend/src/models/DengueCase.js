const mongoose = require("mongoose");
const { CASE_TYPES, CASE_SEVERITIES, CASE_STATUSES } = require("../constants/caseConstants");

const dengueCaseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    diagnosisDate: {
      type: Date,
      required: true,
    },
    hospital: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalRegistrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    caseType: {
      type: String,
      required: true,
      enum: CASE_TYPES,
    },
    severity: {
      type: String,
      required: true,
      enum: CASE_SEVERITIES,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    plateletCount: {
      type: Number,
      default: null,
    },
    bloodTestResult: {
      type: String,
      required: true,
      trim: true,
    },
    dateSymptomsStarted: {
      type: Date,
      default: null,
    },
    admissionDate: {
      type: Date,
      default: null,
    },
    dischargeDate: {
      type: Date,
      default: null,
    },
    currentStatus: {
      type: String,
      enum: CASE_STATUSES,
      default: "Active",
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
      address: {
        type: String,
        default: "",
        trim: true,
      },
      district: {
        type: String,
        default: "",
        trim: true,
      },
      mohArea: {
        type: String,
        default: "",
        trim: true,
      },
      source: {
        type: String,
        default: "manual",
        trim: true,
      },
      capturedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

dengueCaseSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("DengueCase", dengueCaseSchema);
