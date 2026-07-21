import { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { mapService } from '../../services/mapService';
import CaseLeafletMap from './CaseLeafletMap';

const DashboardMiniMap = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const loadCases = async () => {
      setLoading(true);

      try {
        const response = await mapService.getMapCases({ limit: 25 });
        setCases(response.data || []);
      } catch {
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading mini map..." />;
  }

  return <CaseLeafletMap cases={cases} showHeatmap height="320px" />;
};

export default DashboardMiniMap;