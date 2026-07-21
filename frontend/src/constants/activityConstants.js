export const ACTIVITY_TYPES = [
  "Dengue Patients Home Visit",
  "Field Visit",
  "Source Check",
  "Other",
];

export const EMPTY_ACTIVITY_ITEM = {
  activityType: "",
  customActivityType: "",
  patientName: "",
  patient: null,
  notes: "",
  location: {
    coordinates: undefined, // [longitude, latitude]
    name: "",
  },
};
