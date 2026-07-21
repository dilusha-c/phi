import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Calendar, User, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';
import useNotification from '../../hooks/useNotification';
import { activityService } from '../../services/activityService';
import { ACTIVITY_TYPES, EMPTY_ACTIVITY_ITEM } from '../../constants/activityConstants';
import ActivityMapSelector from '../../components/activities/ActivityMapSelector';
import { patientService } from '../../services/patientService';
import { AuthContext } from '../../context/AuthContext';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white dark:border-slate-800 dark:bg-slate-800/70 dark:text-white';

const errorClassName = 'mt-1 text-xs font-semibold text-rose-600';

const AddActivityPage = () => {
  const navigate = useNavigate();
  const { pushNotification } = useNotification();
  const { user } = useContext(AuthContext);
  const [phiId, setPhiId] = useState(user?.phiId || 'PHI-001');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (user?.role === 'PHI' && user.phiId) {
      setPhiId(user.phiId);
    }
  }, [user]);
  const [activities, setActivities] = useState([{
    activityType: '',
    customActivityType: '',
    patientName: '',
    patient: null,
    notes: '',
    location: {
      coordinates: undefined,
      name: ''
    }
  }]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearchOptions, setPatientSearchOptions] = useState({});
  const [notes, setNotes] = useState('');

  const handlePatientSearch = async (index, value) => {
    const nextActivities = [...activities];
    nextActivities[index] = {
      ...nextActivities[index],
      patientName: value,
      patient: null
    };
    setActivities(nextActivities);

    if (!value || value.trim() === '') {
      setPatientSearchOptions(prev => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const response = await patientService.getPatients({ name: value, limit: 5 });
      setPatientSearchOptions(prev => ({
        ...prev,
        [index]: response.data || []
      }));
    } catch (err) {
      console.error('Patient search failed:', err);
    }
  };

  const handleSelectPatient = (index, pat) => {
    const nextActivities = [...activities];
    const name = `${pat.firstName} ${pat.lastName}`;
    const locationName = `${pat.address || ''}, ${pat.gnDivision || ''}, ${pat.mohArea || ''}`.replace(/^, |, $/g, '').trim();

    nextActivities[index] = {
      ...nextActivities[index],
      patientName: name,
      patient: pat._id,
      location: {
        ...nextActivities[index].location,
        name: locationName
      }
    };
    setActivities(nextActivities);
    setPatientSearchOptions(prev => ({ ...prev, [index]: [] }));
  };

  const handleAddActivity = () => {
    setActivities([
      ...activities,
      {
        activityType: '',
        customActivityType: '',
        patientName: '',
        patient: null,
        notes: '',
        location: {
          coordinates: undefined,
          name: ''
        }
      }
    ]);
  };

  const handleRemoveActivity = (index) => {
    if (activities.length === 1) return;
    const nextActivities = [...activities];
    nextActivities.splice(index, 1);
    setActivities(nextActivities);
    
    // Clear errors for deleted index
    const nextErrors = { ...errors };
    Object.keys(nextErrors).forEach(key => {
      if (key.startsWith(`activities.${index}.`)) {
        delete nextErrors[key];
      }
    });
    setErrors(nextErrors);
  };

  const handleActivityChange = (index, field, value) => {
    const nextActivities = [...activities];
    nextActivities[index] = {
      ...nextActivities[index],
      [field]: value
    };
    setActivities(nextActivities);
    
    const key = `activities.${index}.${field}`;
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleLocationChange = (index, coordinates, name = undefined) => {
    const nextActivities = [...activities];
    const prevLocation = nextActivities[index].location;
    
    nextActivities[index] = {
      ...nextActivities[index],
      location: {
        coordinates: coordinates, // [latitude, longitude]
        name: name !== undefined ? name : prevLocation.name
      }
    };
    setActivities(nextActivities);

    const locationKey = `activities.${index}.location`;
    if (errors[locationKey]) {
      setErrors(prev => ({ ...prev, [locationKey]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!phiId || phiId.trim() === '') {
      newErrors.phiId = 'PHI ID is required';
    }
    if (!date || date === '') {
      newErrors.date = 'Date is required';
    }

    activities.forEach((activity, idx) => {
      if (!activity.activityType) {
        newErrors[`activities.${idx}.activityType`] = 'Activity type is required';
      }
      if (activity.activityType === 'Other' && (!activity.customActivityType || activity.customActivityType.trim() === '')) {
        newErrors[`activities.${idx}.customActivityType`] = 'Description is required for Other';
      }
      
      const hasMap = Array.isArray(activity.location?.coordinates) && activity.location.coordinates.length === 2;
      const hasText = activity.location?.name && activity.location.name.trim() !== '';
      if (!hasMap && !hasText) {
        newErrors[`activities.${idx}.location`] = 'Either select a location on the map OR type a location name';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      pushNotification({
        type: 'error',
        title: 'Validation error',
        message: 'Please resolve errors on the form before saving.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Map coordinates to [longitude, latitude] for backend GeoJSON standard
      const payloadActivities = activities.map(act => {
        let coords;
        if (Array.isArray(act.location.coordinates)) {
          // Leaflet value is [lat, lon]. Backend expects [lon, lat]
          coords = [act.location.coordinates[1], act.location.coordinates[0]];
        }
        return {
          activityType: act.activityType,
          customActivityType: act.activityType === 'Other' ? act.customActivityType : '',
          patientName: act.activityType === 'Dengue Patients Home Visit' ? act.patientName : '',
          patient: act.activityType === 'Dengue Patients Home Visit' ? act.patient : null,
          notes: act.notes || '',
          location: {
            coordinates: coords,
            name: act.location.name
          }
        };
      });

      const payload = {
        phiId,
        date,
        activities: payloadActivities,
        notes
      };

      await activityService.createActivity(payload);
      pushNotification({
        type: 'success',
        title: 'Activity Log Saved',
        message: `Daily activity log for ${date} was saved successfully.`
      });
      navigate('/activities');
    } catch (err) {
      pushNotification({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Unable to save activity log.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-300">Daily Activities</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Log Daily Activity</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Record field activities, source checks, and patient home visits.</p>
        </div>
        <Link to="/activities" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Log Metadata Card */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary-600 dark:text-primary-300" />
            General Log Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Activity Date
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClassName}
              />
              {errors.date && <p className={errorClassName}>{errors.date}</p>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                PHI ID
              </span>
              <input
                type="text"
                value={phiId}
                onChange={(e) => setPhiId(e.target.value)}
                placeholder="e.g. PHI-005"
                disabled={user?.role === 'PHI'}
                className={`${inputClassName} ${user?.role === 'PHI' ? 'opacity-75 cursor-not-allowed bg-slate-150 dark:bg-slate-800/80' : ''}`}
              />
              {errors.phiId && <p className={errorClassName}>{errors.phiId}</p>}
            </label>
          </div>
        </div>

        {/* Dynamic Activity List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Logged Activities ({activities.length})</h3>
            <button
              type="button"
              onClick={handleAddActivity}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-soft"
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </button>
          </div>

          {activities.map((activity, idx) => {
            const hasError = errors[`activities.${idx}.location`];
            return (
              <div key={idx} className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/90 space-y-4 transition hover:border-slate-300">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-300">
                    Activity #{idx + 1}
                  </span>
                  {activities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Remove Activity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left Column: Activity Type & Custom Type */}
                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Activity Type</span>
                      <select
                        value={activity.activityType}
                        onChange={(e) => handleActivityChange(idx, 'activityType', e.target.value)}
                        className={inputClassName}
                      >
                        <option value="">Select activity type</option>
                        {ACTIVITY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors[`activities.${idx}.activityType`] && (
                        <p className={errorClassName}>{errors[`activities.${idx}.activityType`]}</p>
                      )}
                    </label>

                    {activity.activityType === 'Dengue Patients Home Visit' && (
                      <div className="relative block">
                        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Patient Name</span>
                        <input
                          type="text"
                          value={activity.patientName || ''}
                          onChange={(e) => handlePatientSearch(idx, e.target.value)}
                          placeholder="Type patient name to search..."
                          className={inputClassName}
                        />
                        {patientSearchOptions[idx] && patientSearchOptions[idx].length > 0 && (
                          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                            {patientSearchOptions[idx].map((pat) => (
                              <li key={pat._id}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectPatient(idx, pat)}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition truncate block text-slate-700 dark:text-slate-300 font-semibold"
                                >
                                  {pat.patientId} - {pat.firstName} {pat.lastName} ({pat.nic || 'No NIC'})
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {activity.activityType === 'Other' && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Custom Activity Description</span>
                        <input
                          type="text"
                          value={activity.customActivityType}
                          onChange={(e) => handleActivityChange(idx, 'customActivityType', e.target.value)}
                          placeholder="Please describe this activity"
                          className={inputClassName}
                        />
                        {errors[`activities.${idx}.customActivityType`] && (
                          <p className={errorClassName}>{errors[`activities.${idx}.customActivityType`]}</p>
                        )}
                      </label>
                    )}

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between items-center">
                        <span>Location Name (Typed)</span>
                        <span className="text-xs text-slate-400 font-normal">Either Map Selection or Typed Name is required</span>
                      </span>
                      <input
                        type="text"
                        value={activity.location.name}
                        onChange={(e) => handleActivityChange(idx, 'location', { ...activity.location, name: e.target.value })}
                        placeholder="e.g. Maligawatta MOH premises, or school garden"
                        className={inputClassName}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Activity Notes / Remarks</span>
                      <textarea
                        value={activity.notes || ''}
                        onChange={(e) => handleActivityChange(idx, 'notes', e.target.value)}
                        placeholder="e.g. Checked breeding containers, found no larvae"
                        rows="2"
                        className={inputClassName}
                      />
                    </label>

                    {hasError && (
                      <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{hasError}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Map Selection */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Location on Map (Optional)</span>
                    <ActivityMapSelector
                      value={activity.location.coordinates}
                      onChange={(coords, resolvedName) => handleLocationChange(idx, coords, resolvedName)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plus Button below cards */}
        <div className="flex justify-center border-t border-slate-200 dark:border-slate-800 pt-6">
          <button
            type="button"
            onClick={handleAddActivity}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-8 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-100/70 transition w-full max-w-md dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/80"
          >
            <Plus className="h-4 w-4 text-slate-500" />
            Add Another Activity
          </button>
        </div>

        {/* Notes Text Area */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Notes / Remarks</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional remarks or notes for the day..."
              rows="3"
              className={inputClassName}
            />
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6 pb-12">
          <Link
            to="/activities"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700 shadow-soft disabled:cursor-not-allowed disabled:opacity-75 flex items-center gap-2"
          >
            {isSubmitting ? 'Saving Log...' : 'Save Daily Log'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddActivityPage;
