export const INSPECTION_BREEDING_PLACES = [
  'Water Tank',
  'Tyres',
  'Flower Pots',
  'Construction Site',
  'Waste Collection Area',
  'Other',
];

export const INSPECTION_STATUS = ['Pending', 'Completed', 'Follow-up Required'];

export const EMPTY_INSPECTION_FORM = {
  dengueCase: '',
  phiOfficer: '',
  inspectionDate: '',
  inspectionTime: '',
  breedingPlaces: [],
  larvaeFound: false,
  waterTank: false,
  tyres: false,
  flowerPots: false,
  constructionSite: false,
  wasteCollection: false,
  latitude: '',
  longitude: '',
  notes: '',
  nextInspectionDate: '',
  currentStatus: 'Pending',
};
