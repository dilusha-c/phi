import { useEffect, useState } from 'react';
import { PATIENT_GENDERS, DENGUE_SOURCE_PLACE_TYPES, EMPTY_PATIENT_FORM } from '../../constants/patientConstants';
import { validatePatientForm } from '../../utils/validation';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white';

const errorClassName = 'mt-2 text-xs font-medium text-rose-600';

const PatientForm = ({ initialValues = EMPTY_PATIENT_FORM, onSubmit, submitLabel, isSubmitting }) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      ...EMPTY_PATIENT_FORM,
      ...initialValues,
    });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validatePatientForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSubmit(formData);
  };

  const fieldError = (field) => (errors[field] ? <p className={errorClassName}>{errors[field]}</p> : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-soft backdrop-blur">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Patient Identity</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">First Name</span>
              <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClassName} />
              {fieldError('firstName')}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Last Name</span>
              <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClassName} />
              {fieldError('lastName')}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Gender</span>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputClassName}>
                <option value="">Select gender</option>
                {PATIENT_GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
              {fieldError('gender')}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Dengue Source Place Type</span>
              <select name="dengueSourcePlaceType" value={formData.dengueSourcePlaceType} onChange={handleChange} className={inputClassName}>
                <option value="">Select source place type</option>
                {DENGUE_SOURCE_PLACE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {fieldError('dengueSourcePlaceType')}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Dengue Source Place</span>
              <input name="dengueSourcePlace" value={formData.dengueSourcePlace || ''} onChange={handleChange} placeholder="Enter source location/name" className={inputClassName} />
              {fieldError('dengueSourcePlace')}
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Location & Address</h3>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Address</span>
              <textarea name="address" rows="4" value={formData.address} onChange={handleChange} className={inputClassName} />
              {fieldError('address')}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Province</span>
                <input name="province" value={formData.province} onChange={handleChange} className={inputClassName} />
                {fieldError('province')}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">District</span>
                <input name="district" value={formData.district} onChange={handleChange} className={inputClassName} />
                {fieldError('district')}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">MOH Area</span>
                <input name="mohArea" value={formData.mohArea} onChange={handleChange} className={inputClassName} />
                {fieldError('mohArea')}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">GN Division</span>
                <input name="gnDivision" value={formData.gnDivision} onChange={handleChange} className={inputClassName} />
                {fieldError('gnDivision')}
              </label>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
