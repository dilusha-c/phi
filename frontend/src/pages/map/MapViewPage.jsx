import { useEffect, useMemo, useState } from 'react';
import { MapPin, Activity, Droplets, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MapFilters from '../../components/map/MapFilters';
import MapToolbar from '../../components/map/MapToolbar';
import MarkerLegend from '../../components/map/MarkerLegend';
import CaseLeafletMap from '../../components/map/CaseLeafletMap';
import CaseDetailsPanel from '../../components/map/CaseDetailsPanel';
import { mapService } from '../../services/mapService';
import { activityService } from '../../services/activityService';
import { MAP_DEFAULT_CENTER } from '../../constants/mapConstants';

const StatCard = ({ icon: Icon, label, value, tone = 'primary' }) => {
  const toneStyles = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className={`rounded-2xl p-3 ${toneStyles[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const defaultFilters = {
  search: '',
  district: '',
  mohArea: '',
  from: '',
  to: '',
  selectedMonth: '',
  selectedYear: new Date().getFullYear().toString(),
  types: ['Patient', 'Home Visit', 'Field Visit', 'Source Check', 'Other']
};

const MapViewPage = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [points, setPoints] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [loading, setLoading] = useState(true);

  // Filter markers and heatmap values dynamically based on selected checkboxes
  const filteredPoints = useMemo(() => {
    return points.filter((p) => filters.types.includes(p.markerType));
  }, [points, filters.types]);

  // Selected marker details memo
  const selectedCase = useMemo(() => {
    return (
      filteredPoints.find((item) => String(item._id) === String(selectedCaseId)) ||
      filteredPoints[0] ||
      null
    );
  }, [filteredPoints, selectedCaseId]);

  const loadMapData = async (nextFilters = filters) => {
    setLoading(true);

    try {
      // 1. Calculate Date Range bounds from Month Selection
      let fromDate = nextFilters.from;
      let toDate = nextFilters.to;

      if (nextFilters.selectedMonth) {
        const monthVal = nextFilters.selectedMonth;
        const yearVal = nextFilters.selectedYear;
        fromDate = `${yearVal}-${monthVal}-01`;
        const lastDayNum = new Date(parseInt(yearVal), parseInt(monthVal), 0).getDate();
        toDate = `${yearVal}-${monthVal}-${lastDayNum.toString().padStart(2, '0')}`;
      }

      // Define Request Parameters
      const casesParams = {
        search: nextFilters.search.trim(),
        district: nextFilters.district.trim(),
        mohArea: nextFilters.mohArea.trim(),
        from: fromDate,
        to: toDate,
        limit: 1000
      };

      const activitiesParams = {
        phiId: nextFilters.search.trim(),
        startDate: fromDate,
        endDate: toDate,
        limit: 1000
      };

      // 2. Fetch cases and daily logs concurrently
      const [casesResponse, activitiesResponse] = await Promise.all([
        mapService.getMapCases(casesParams),
        activityService.getActivities(activitiesParams)
      ]);

      const casesData = casesResponse.data || [];
      const activitiesData = activitiesResponse.data || [];

      // 3. Map Cases to Points format (Red Pin type 'Patient')
      const casesPoints = casesData.map(c => ({
        _id: c._id,
        id: c.caseId,
        name: c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : 'Dengue Patient',
        markerType: 'Patient',
        date: c.diagnosisDate,
        location: c.location,
        details: `Hospital: ${c.hospital} | Status: ${c.currentStatus}`,
        raw: c
      }));

      // 4. Flatten Activities logs to geocoded points
      const activityPoints = [];
      activitiesData.forEach(log => {
        if (log.activities && Array.isArray(log.activities)) {
          log.activities.forEach((act, actIdx) => {
            if (act.location && Array.isArray(act.location.coordinates) && act.location.coordinates.length === 2) {
              let mType = 'Other';
              if (act.activityType === 'Dengue Patients Home Visit') {
                mType = 'Home Visit';
              } else if (act.activityType === 'Field Visit') {
                mType = 'Field Visit';
              } else if (act.activityType === 'Source Check') {
                mType = 'Source Check';
              }

              activityPoints.push({
                _id: `${log._id}-${actIdx}`,
                id: log.activityLogId,
                name: log.phiName ? `PHI Name: ${log.phiName}` : `PHI ID: ${log.phiId}`,
                markerType: mType,
                date: log.date,
                location: {
                  coordinates: act.location.coordinates,
                  name: act.location.name || 'Mapped Location'
                },
                details: act.notes || '-',
                raw: { ...log, selectedActivity: act }
              });
            }
          });
        }
      });

      const merged = [...casesPoints, ...activityPoints];
      setPoints(merged);

      // 5. Compute Statistics for visual widgets
      setStatistics({
        totalCases: casesPoints.length,
        activeCases: casesPoints.filter(p => p.raw?.currentStatus === 'Active').length,
        totalActivities: activityPoints.length
      });

      // Automatically select first element if coordinates exist
      if (merged.length > 0) {
        setSelectedCaseId(merged[0]._id);
      } else {
        setSelectedCaseId(null);
      }
    } catch (error) {
      console.error('Error fetching map view coordinates data:', error);
      setPoints([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      window.open(
        `https://www.openstreetmap.org/?mlat=${position.coords.latitude}&mlon=${position.coords.longitude}#map=14/${position.coords.latitude}/${position.coords.longitude}`,
        '_blank',
        'noopener,noreferrer'
      );
    });
  };

  const caseTotal = statistics?.totalCases || 0;
  const activeTotal = statistics?.activeCases || 0;
  const activityTotal = statistics?.totalActivities || 0;

  if (loading && points.length === 0) {
    return <LoadingSpinner label="Compiling surveillance coordinates map..." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 p-6 text-white shadow-soft sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-200">GIS Surveillance Map</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Dengue Cases & PHI Activities Map</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
            Visualize active Dengue patient cases alongside daily PHI field visits, home visits, and source checks on a unified geographic map.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard icon={Activity} label="Mapped Cases" value={caseTotal} tone="primary" />
        <StatCard icon={ShieldAlert} label="Active Cases" value={activeTotal} tone="sky" />
        <StatCard icon={Droplets} label="Mapped Activities" value={activityTotal} tone="amber" />
        <StatCard icon={MapPin} label="Default View" value={`${MAP_DEFAULT_CENTER[0].toFixed(2)}, ${MAP_DEFAULT_CENTER[1].toFixed(2)}`} tone="emerald" />
      </section>

      <MapFilters
        filters={filters}
        onChange={setFilters}
        onSubmit={() => loadMapData(filters)}
        onReset={() => {
          setFilters(defaultFilters);
          loadMapData(defaultFilters);
        }}
      />

      <MapToolbar
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap((current) => !current)}
        onRefresh={() => loadMapData(filters)}
        onLocate={handleLocate}
        onResetView={() => setSelectedCaseId(filteredPoints[0]?._id || null)}
      />

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <CaseLeafletMap
          points={filteredPoints}
          selectedCaseId={selectedCaseId}
          onSelectCase={(item) => setSelectedCaseId(item._id)}
          showHeatmap={showHeatmap}
          height="760px"
        />
        <CaseDetailsPanel selectedCase={selectedCase} />
      </section>

      <MarkerLegend />
    </div>
  );
};

export default MapViewPage;