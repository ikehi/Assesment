import { useEffect, useState } from 'react';
import Map from './components/Map';
import InfoPanel from './components/InfoPanel';
import { Hospital, Ambulance, NearestAmbulanceResult } from './types';
import { fetchHospitals, fetchAmbulances, findNearestAmbulance } from './services/api';
import './App.css';

function App() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [nearestAmbulance, setNearestAmbulance] = useState<NearestAmbulanceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hospitalsData, ambulancesData] = await Promise.all([
        fetchHospitals(),
        fetchAmbulances(),
      ]);
      setHospitals(hospitalsData);
      setAmbulances(ambulancesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalClick = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setNearestAmbulance(null);
    
    try {
      const result = await findNearestAmbulance(hospital.id);
      setNearestAmbulance(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find nearest ambulance');
    }
  };

  const handleAmbulanceUpdate = async () => {
    try {
      const updatedAmbulances = await fetchAmbulances();
      setAmbulances(updatedAmbulances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh ambulances');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>GIS Hospital Dashboard</h1>
        <button onClick={loadData} className="refresh-btn">
          Refresh Data
        </button>
      </div>
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      <div className="main-content">
        <Map
          hospitals={hospitals}
          ambulances={ambulances}
          selectedHospital={selectedHospital}
          nearestAmbulance={nearestAmbulance}
          onHospitalClick={handleHospitalClick}
        />
        <InfoPanel
          selectedHospital={selectedHospital}
          nearestAmbulance={nearestAmbulance}
          onAmbulanceUpdate={handleAmbulanceUpdate}
        />
      </div>
    </div>
  );
}

export default App;
