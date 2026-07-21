export const validatePatientForm = (values) => {
  const errors = {};
  const requiredFields = [
    'firstName',
    'lastName',
    'gender',
    'dengueSourcePlaceType',
    'dengueSourcePlace',
    'address',
    'province',
    'district',
    'mohArea',
    'gnDivision',
  ];

  requiredFields.forEach((field) => {
    if (!values[field] || String(values[field]).trim() === '') {
      errors[field] = 'This field is required';
    }
  });

  return errors;
};
