import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points = [], visible = false }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) {
      return undefined;
    }

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!visible || points.length === 0) {
      return undefined;
    }

    const heatLayer = L.heatLayer(points, {
      radius: 28,
      blur: 20,
      maxZoom: 12,
      gradient: {
        0.1: '#dbeafe',
        0.4: '#38bdf8',
        0.7: '#f59e0b',
        1: '#dc2626',
      },
    });

    heatLayer.addTo(map);
    layerRef.current = heatLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points, visible]);

  return null;
};

export default HeatmapLayer;