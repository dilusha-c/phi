import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../constants/mapConstants';
import { configureLeafletIcons, createStatusMarker } from './leafletSetup';
import HeatmapLayer from './HeatmapLayer';

configureLeafletIcons();

const MARKER_TYPE_COLORS = {
  'Patient': '#dc2626',      // Red
  'Home Visit': '#eab308',   // Yellow
  'Field Visit': '#22c55e',  // Green
  'Source Check': '#f97316', // Orange
  'Other': '#a855f7'         // Purple
};

const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    const coordsList = points
      .filter((item) => Array.isArray(item.location?.coordinates) && item.location.coordinates.length === 2)
      .map((item) => [Number(item.location.coordinates[1]), Number(item.location.coordinates[0])]);

    if (coordsList.length > 0) {
      map.fitBounds(coordsList, { padding: [36, 36], maxZoom: 12 });
    }
  }, [points, map]);

  return null;
};

const MapMarkerCluster = ({ points, selectedCaseId, onSelectCase }) => {
  const clusterStyle = useMemo(
    () =>
      L.divIcon({
        className: 'marker-cluster-custom',
        html: '<div></div>',
        iconSize: [36, 36],
      }),
    []
  );

  return (
    <MarkerClusterGroup chunkedLoading iconCreateFunction={() => clusterStyle}>
      {points
        .filter((item) => Array.isArray(item.location?.coordinates) && item.location.coordinates.length === 2)
        .map((item) => {
          const coordinates = item.location.coordinates;
          const latitude = Number(coordinates[1]);
          const longitude = Number(coordinates[0]);
          const isSelected = String(item._id) === String(selectedCaseId);
          const color = isSelected ? '#0f172a' : MARKER_TYPE_COLORS[item.markerType] || '#a855f7';
          const marker = createStatusMarker(color);

          return (
            <Marker
              key={item._id}
              position={[latitude, longitude]}
              icon={marker}
              eventHandlers={{
                click: () => onSelectCase?.(item),
              }}
            >
              <Popup>
                <div className="space-y-1.5 text-sm">
                  <p className="font-bold text-slate-900">{item.id}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.markerType}</p>
                  <p className="text-slate-650 font-medium">{item.name}</p>
                  <p className="text-slate-500 text-xs truncate max-w-[190px]">{item.location?.name || item.location?.address || 'Selected Spot'}</p>
                  <button
                    type="button"
                    onClick={() => onSelectCase?.(item)}
                    className="mt-2 w-full text-center rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition shadow-sm"
                  >
                    Inspect details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MarkerClusterGroup>
  );
};

const CaseLeafletMap = ({ points = [], selectedCaseId, onSelectCase, showHeatmap = false, height = '620px' }) => {
  const heatPoints = useMemo(
    () =>
      points
        .filter((item) => Array.isArray(item.location?.coordinates) && item.location.coordinates.length === 2)
        .map((item) => [
          Number(item.location.coordinates[1]), 
          Number(item.location.coordinates[0]), 
          item.markerType === 'Patient' ? 0.95 : 0.65
        ]),
    [points]
  );

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900" style={{ minHeight: height }}>
      <MapContainer center={MAP_DEFAULT_CENTER} zoom={MAP_DEFAULT_ZOOM} className="h-full w-full" style={{ minHeight: height }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <HeatmapLayer points={heatPoints} visible={showHeatmap} />
        <MapMarkerCluster points={points} selectedCaseId={selectedCaseId} onSelectCase={onSelectCase} />
      </MapContainer>
    </div>
  );
};

export default CaseLeafletMap;