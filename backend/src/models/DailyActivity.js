const mongoose = require("mongoose");

const activityItemSchema = new mongoose.Schema({
  activityType: {
    type: String,
    required: true,
    enum: ["Dengue Patients Home Visit", "Field Visit", "Source Check", "Other"],
  },
  customActivityType: {
    type: String,
    default: "",
    trim: true,
  },
  patientName: {
    type: String,
    default: "",
    trim: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    default: null,
  },
  notes: {
    type: String,
    default: "",
    trim: true,
  },
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
  },
});

const dailyActivitySchema = new mongoose.Schema(
  {
    activityLogId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    phiId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    activities: {
      type: [activityItemSchema],
      required: true,
      validate: [
        {
          validator: function (val) {
            return val && val.length > 0;
          },
          message: "At least one activity must be recorded.",
        },
        {
          validator: function (val) {
            return val.every(
              (act) =>
                (act.location && act.location.name && act.location.name.trim() !== "") ||
                (act.location && Array.isArray(act.location.coordinates) && act.location.coordinates.length === 2)
            );
          },
          message: "Each activity must have either a map location or a typed location name.",
        },
      ],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DailyActivity", dailyActivitySchema);
