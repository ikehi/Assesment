import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Hospital, Ambulance, NearestAmbulanceResult } from '../types';
import 'maplibre-gl/dist/maplibre-gl.css';
import './Map.css';

interface MapProps {
  hospitals: Hospital[];
  ambulances: Ambulance[];
  selectedHospital: Hospital | null;
  nearestAmbulance: NearestAmbulanceResult | null;
  onHospitalClick: (hospital: Hospital) => void;
}

export default function Map({
  hospitals,
  ambulances,
  selectedHospital,
  nearestAmbulance,
  onHospitalClick,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Wait for container to have proper dimensions
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const checkAndInit = () => {
      if (cancelled) return;
      if (!mapContainer.current) return;
      
      const rect = mapContainer.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        // Container not ready, try again
        retryTimer = setTimeout(checkAndInit, 100);
        return;
      }

      try {
        console.log('Initializing MapLibre map...', { width: rect.width, height: rect.height });
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            sources: {
              'raster-tiles': {
                type: 'raster',
                tiles: [
                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                ],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
              },
            },
            layers: [
              {
                id: 'simple-tiles',
                type: 'raster',
                source: 'raster-tiles',
                minzoom: 0,
                maxzoom: 22,
              },
            ],
          },
        center: [7.4951, 9.0765], // Center of Nigeria (Abuja)
        zoom: 6,
        });

        map.current.on('load', () => {
          console.log('Map loaded successfully');
          setMapLoaded(true);
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e);
        });

      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    // Start initialization check
    checkAndInit();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      map.current?.remove();
      map.current = null; // React 18 StrictMode runs effects twice in dev; ensure re-init is possible.
      setMapLoaded(false);
    };
  }, []);

  // Add hospitals to map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing hospital markers
    hospitals.forEach((hospital) => {
      const markerId = `hospital-${hospital.id}`;
      const existingMarker = document.getElementById(markerId);
      if (existingMarker) {
        existingMarker.remove();
      }
    });

    // Add hospital markers
    hospitals.forEach((hospital) => {
      const el = document.createElement('div');
      el.id = `hospital-${hospital.id}`;
      el.className = 'hospital-marker';
      el.innerHTML = '🏥';
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';
      el.title = hospital.name;

      el.addEventListener('click', () => {
        onHospitalClick(hospital);
      });

      new maplibregl.Marker({ element: el })
        .setLngLat([hospital.longitude, hospital.latitude])
        .addTo(map.current!);
    });
  }, [hospitals, mapLoaded, onHospitalClick]);

  // Add ambulances to map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing ambulance markers
    ambulances.forEach((ambulance) => {
      const markerId = `ambulance-${ambulance.id}`;
      const existingMarker = document.getElementById(markerId);
      if (existingMarker) {
        existingMarker.remove();
      }
    });

    // Add ambulance markers
    ambulances.forEach((ambulance) => {
      const el = document.createElement('div');
      el.id = `ambulance-${ambulance.id}`;
      el.className = 'ambulance-marker';
      el.innerHTML = '🚑';
      el.style.fontSize = '20px';
      el.title = ambulance.identifier;

      new maplibregl.Marker({ element: el })
        .setLngLat([ambulance.longitude, ambulance.latitude])
        .addTo(map.current!);
    });
  }, [ambulances, mapLoaded]);

  // Highlight selected hospital and nearest ambulance
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedHospital) return;

    // Fly to selected hospital
    map.current.flyTo({
      center: [selectedHospital.longitude, selectedHospital.latitude],
      zoom: 10,
      duration: 1000,
    });

    // Highlight nearest ambulance if available
    if (nearestAmbulance) {
      const { nearestAmbulance: ambulance } = nearestAmbulance;
      
      // Draw line between hospital and nearest ambulance
      const sourceId = 'proximity-line';
      const layerId = 'proximity-line-layer';

      // Remove existing line if any
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }

      // Add line source
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [selectedHospital.longitude, selectedHospital.latitude],
              [ambulance.longitude, ambulance.latitude],
            ],
          },
        },
      });

      // Add line layer
      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#e74c3c',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });
    }
  }, [selectedHospital, nearestAmbulance, mapLoaded]);

  return (
    <div
      ref={mapContainer}
      className="map-container"
      style={{ flex: '1 1 0%', minWidth: 0, width: '100%', height: '100%' }}
    />
  );
}
