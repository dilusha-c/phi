export const CASE_TYPES = ['Suspected', 'Probable', 'Confirmed'];
export const CASE_SEVERITIES = ['Mild', 'Moderate', 'Severe'];
export const CASE_STATUSES = ['Active', 'Recovered', 'Transferred', 'Deceased'];

export const EMPTY_CASE_FORM = {
  patient: '',
  diagnosisDate: '',
  hospital: '',
  hospitalRegistrationNumber: '',
  caseType: 'Suspected',
  severity: 'Mild',
  symptoms: [],
  symptomsText: '',
  plateletCount: '',
  bloodTestResult: '',
  dateSymptomsStarted: '',
  admissionDate: '',
  dischargeDate: '',
  currentStatus: 'Active',
  notes: '',
  locationLatitude: '',
  locationLongitude: '',
  locationAddress: '',
  locationDistrict: '',
  locationMohArea: '',
  locationSource: 'manual',
};
