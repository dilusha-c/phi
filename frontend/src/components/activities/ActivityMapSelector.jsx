import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import axios from 'axios';
import { Search, MapPin, X } from 'lucide-react';
import { MAP_DEFAULT_CENTER } from '../../constants/mapConstants';
import { configureLeafletIcons } from '../map/leafletSetup';

configureLeafletIcons();

// Helper to handle clicks on the Leaflet map
const MapClickHandler = ({ onClick }) => {
  const map = useMap();
  useEffect(() => {
    const handleMapClick = (e) => {
      onClick([e.latlng.lat, e.latlng.lng]);
    };
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onClick]);
  return null;
};

// Helper to pan the map dynamically
const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

const ActivityMapSelector = ({ value, onChange, placeholder = "Search for a place, city or area..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(value || MAP_DEFAULT_CENTER);
  const [isManualInput, setIsManualInput] = useState(false);

  // Sync map center if value changes from outside
  useEffect(() => {
    if (value) {
      setMapCenter(value);
    }
  }, [value]);

  // Debounced search when user types (autocomplete suggestions)
  useEffect(() => {
    if (!isManualInput || !searchQuery || searchQuery.trim().length < 3) {
      if (!searchQuery) {
        setSearchResults([]);
      }
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: searchQuery,
            format: 'json',
            limit: 5,
          }
        });
        setSearchResults(response.data || []);
      } catch (err) {
        console.error("OSM Geocoding debounced search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 650); // 650ms delay to prevent excessive Nominatim API queries

    return () => clearTimeout(timer);
  }, [searchQuery, isManualInput]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery || searchQuery.trim() === '') return;

    setLoading(true);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 5,
        }
      });
      setSearchResults(response.data || []);
    } catch (err) {
      console.error("OSM Geocoding manual search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const coords = [lat, lon];
    
    setIsManualInput(false); // Stop autocomplete triggers when value is assigned
    onChange(coords, result.display_name);
    setMapCenter(coords);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleMapClick = (coords) => {
    onChange(coords);
    setMapCenter(coords);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setIsManualInput(true);
              setSearchQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-10 text-xs outline-none transition focus:border-primary-400 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setIsManualInput(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          <Search className="mr-1 h-3.5 w-3.5" />
          Search
        </button>
      </div>

      {/* Geocoding search results */}
      {searchResults.length > 0 && (
        <ul className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900 z-10 relative text-xs divide-y divide-slate-100 dark:divide-slate-800">
          {searchResults.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition truncate block text-slate-700 dark:text-slate-300"
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Map display */}
      <div className="h-[220px] rounded-2xl overflow-hidden border border-slate-200 relative">
        <MapContainer center={mapCenter} zoom={13} className="h-full w-full" style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          <ChangeMapView center={mapCenter} />
          {value && (
            <Marker position={value}>
              {/* Optional simple popup */}
            </Marker>
          )}
        </MapContainer>
      </div>

      {value && (
        <div className="flex items-center justify-between text-xs text-slate-500 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-emerald-500" />
            Selected: {value[0].toFixed(5)}, {value[1].toFixed(5)}
          </span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-rose-500 hover:text-rose-700 font-semibold"
          >
            Clear Pin
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityMapSelector;
