const mongoose = require("mongoose");
const { INSPECTION_STATUS } = require("../constants/inspectionConstants");

const inspectionSchema = new mongoose.Schema(
  {
    inspectionId: {
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
    phiOfficer: {
      type: String,
      required: true,
      trim: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
    },
    inspectionTime: {
      type: String,
      required: true,
      trim: true,
    },
    breedingPlaces: {
      type: [String],
      default: [],
    },
    larvaeFound: {
      type: Boolean,
      default: false,
    },
    waterTank: {
      type: Boolean,
      default: false,
    },
    tyres: {
      type: Boolean,
      default: false,
    },
    flowerPots: {
      type: Boolean,
      default: false,
    },
    constructionSite: {
      type: Boolean,
      default: false,
    },
    wasteCollection: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
    },
    gpsCoordinates: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    nextInspectionDate: {
      type: Date,
      default: null,
    },
    currentStatus: {
      type: String,
      enum: INSPECTION_STATUS,
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inspection", inspectionSchema);
