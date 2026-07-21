const mongoose = require("mongoose");
const { PATIENT_GENDERS, DENGUE_SOURCE_PLACE_TYPES } = require("../constants/patientConstants");

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    gender: {
      type: String,
      required: true,
      enum: PATIENT_GENDERS,
    },
    dengueSourcePlaceType: {
      type: String,
      required: true,
      enum: DENGUE_SOURCE_PLACE_TYPES,
      index: true,
    },
    dengueSourcePlace: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    province: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    mohArea: {
      type: String,
      required: true,
      trim: true,
    },
    gnDivision: {
      type: String,
      required: true,
      trim: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);
