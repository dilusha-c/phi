const mongoose = require("mongoose");
const { FOLLOW_UP_VISIT_TYPES, FOLLOW_UP_STATUS } = require("../constants/followUpConstants");

const followUpSchema = new mongoose.Schema(
  {
    followUpId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    dengueCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DengueCase",
      required: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    followUpDate: {
      type: Date,
      required: true,
    },
    followUpTime: {
      type: String,
      required: true,
      trim: true,
    },
    phiOfficer: {
      type: String,
      required: true,
      trim: true,
    },
    visitType: {
      type: String,
      required: true,
      enum: FOLLOW_UP_VISIT_TYPES,
    },
    patientCondition: {
      type: String,
      required: true,
      trim: true,
    },
    temperature: {
      type: Number,
      default: null,
    },
    plateletCount: {
      type: Number,
      default: null,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    breedingSitesChecked: {
      type: [String],
      default: [],
    },
    larvaeFound: {
      type: Boolean,
      default: false,
    },
    treatmentProgress: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: FOLLOW_UP_STATUS,
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FollowUp", followUpSchema);
