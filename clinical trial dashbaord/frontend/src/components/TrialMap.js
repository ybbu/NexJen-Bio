import React, { useState } from 'react';
import { MapPin, Calendar, Users, Building2 } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const TrialMap = ({ trials, getScoreBadge, activeTab }) => {
  const [hoveredTrial, setHoveredTrial] = useState(null);
  
  // Ensure trials is always an array
  const safeTrials = Array.isArray(trials) ? trials : [];

  // Parse location data from trials
  const parseLocation = (locationString) => {
    if (!locationString || locationString === 'Unknown') return null;
    
    try {
      // Try to parse JSON location data
      const location = JSON.parse(locationString);
      return {
        city: location.city || 'Unknown',
        country: location.country || 'Unknown',
        facility: location.facility || 'Unknown',
        lat: location.geoPoint?.lat,
        lon: location.geoPoint?.lon
      };
    } catch (e) {
      // If not JSON, try to extract basic info
      const parts = locationString.split(',');
      return {
        city: parts[0]?.trim() || 'Unknown',
        country: parts[parts.length - 1]?.trim() || 'Unknown',
        facility: 'Unknown',
        lat: null,
        lon: null
      };
    }
  };

  // Generate mock coordinates for trials without GPS data
  const generateMockCoordinates = (trial, index) => {
    // Use a simple hash of the trial ID to generate consistent coordinates
    const nctId = trial.nctId || `trial-${index}`;
    const hash = nctId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Generate coordinates within reasonable bounds for major trial locations
    const majorLocations = [
      { lat: 40.7128, lon: -74.0060 }, // New York
      { lat: 34.0522, lon: -118.2437 }, // Los Angeles
      { lat: 41.8781, lon: -87.6298 }, // Chicago
      { lat: 29.7604, lon: -95.3698 }, // Houston
      { lat: 39.9526, lon: -75.1652 }, // Philadelphia
      { lat: 33.7490, lon: -84.3880 }, // Atlanta
      { lat: 42.3601, lon: -71.0589 }, // Boston
      { lat: 37.7749, lon: -122.4194 }, // San Francisco
      { lat: 47.6062, lon: -122.3321 }, // Seattle
      { lat: 25.7617, lon: -80.1918 }, // Miami
      { lat: 51.5074, lon: -0.1278 }, // London
      { lat: 48.8566, lon: 2.3522 }, // Paris
      { lat: 52.5200, lon: 13.4050 }, // Berlin
      { lat: 41.9028, lon: 12.4964 }, // Rome
      { lat: 40.4168, lon: -3.7038 }, // Madrid
      { lat: 55.7558, lon: 37.6176 }, // Moscow
      { lat: 35.6762, lon: 139.6503 }, // Tokyo
      { lat: 39.9042, lon: 116.4074 }, // Beijing
      { lat: 22.3193, lon: 114.1694 }, // Hong Kong
      { lat: 1.3521, lon: 103.8198 }, // Singapore
      { lat: -33.8688, lon: 151.2093 }, // Sydney
      { lat: -37.8136, lon: 144.9631 }, // Melbourne
      { lat: 43.6532, lon: -79.3832 }, // Toronto
      { lat: 45.5017, lon: -73.5673 }, // Montreal
    ];
    
    // Use hash to select from major locations
    const locationIndex = hash % majorLocations.length;
    return majorLocations[locationIndex];
  };

  // Process trials to get locations
  const trialLocations = safeTrials
    .map((trial, index) => {
      const location = parseLocation(trial.locations);
      if (!location) return null;
      
      // Use actual coordinates if available, otherwise generate mock ones
      const coords = location.lat && location.lon 
        ? { lat: location.lat, lon: location.lon }
        : generateMockCoordinates(trial, index);
      
      return {
        ...trial,
        location: {
          ...location,
          ...coords
        }
      };
    })
    .filter(trial => trial !== null);

  // Group trials by location to avoid overlapping pins
  const groupedTrials = {};
  trialLocations.forEach(trial => {
    // Check if lat and lon are valid numbers before calling toFixed
    if (trial.location.lat != null && trial.location.lon != null && 
        !isNaN(trial.location.lat) && !isNaN(trial.location.lon)) {
      const key = `${trial.location.lat.toFixed(2)},${trial.location.lon.toFixed(2)}`;
      if (!groupedTrials[key]) {
        groupedTrials[key] = [];
      }
      groupedTrials[key].push(trial);
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStudyTypeColor = (studyType) => {
    switch (studyType?.toUpperCase()) {
      case 'INTERVENTIONAL': return 'bg-blue-500';
      case 'OBSERVATIONAL': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative w-full h-[800px] bg-white rounded-lg border overflow-hidden">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 200
        }}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <ZoomableGroup zoom={1} maxZoom={4}>
          <Geographies
            geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
            fill="#e5e7eb"
            stroke="#d1d5db"
            strokeWidth={0.5}
          >
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#d1d5db", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Map Pins */}
          {Object.entries(groupedTrials).map(([coords, trialsAtLocation], index) => {
            const [lat, lon] = coords.split(',').map(Number);
            const [firstTrial] = trialsAtLocation;
            
            // Additional safety check for valid coordinates
            if (isNaN(lat) || isNaN(lon)) {
              return null;
            }
            
            return (
              <Marker
                key={coords}
                coordinates={[lon, lat]}
                onMouseEnter={() => setHoveredTrial(firstTrial)}
                onMouseLeave={() => setHoveredTrial(null)}
              >
                <g>
                  {/* Pin */}
                  <circle
                    r={trialsAtLocation.length > 1 ? 8 : 6}
                    fill={getStudyTypeColor(firstTrial.studyType).replace('bg-blue-500', '#3b82f6').replace('bg-purple-500', '#8b5cf6').replace('bg-gray-500', '#6b7280')}
                    stroke="white"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Pin count badge if multiple trials */}
                  {trialsAtLocation.length > 1 && (
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {trialsAtLocation.length}
                    </text>
                  )}
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover Tooltip */}
      {hoveredTrial && (
        <div 
          className="absolute bg-white rounded-lg shadow-xl border p-4 max-w-sm z-20"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        >
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <a
                  href={`https://clinicaltrials.gov/ct2/show/${hoveredTrial.nctId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-primary hover:text-primary/80 transition-colors"
                >
                  {hoveredTrial.nctId}
                </a>
                {getScoreBadge && getScoreBadge(hoveredTrial.nctId)}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStudyTypeColor(hoveredTrial.studyType)} text-white`}>
                {hoveredTrial.studyType}
              </span>
            </div>

            {/* Title */}
            <h4 className="font-semibold text-sm line-clamp-2">
              {hoveredTrial.briefTitle}
            </h4>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{hoveredTrial.location.city}, {hoveredTrial.location.country}</span>
            </div>

            {/* Trial Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{hoveredTrial.enrollmentCount ? `${hoveredTrial.enrollmentCount.toLocaleString()}` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(hoveredTrial.startDate)}</span>
              </div>
            </div>

            {/* Status */}
            {hoveredTrial.overallStatus && (
              <div className="text-xs">
                <span className="font-medium">Status: </span>
                <span className="text-muted-foreground">{hoveredTrial.overallStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Legend - Only show on combined tab */}
      {activeTab === 'combined' && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border p-3">
          <div className="text-sm font-medium mb-2">Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Interventional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Observational</span>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default TrialMap;
