import { useState } from 'react';
import { Hospital, NearestAmbulanceResult } from '../types';
import { updateAmbulancePosition } from '../services/api';
import './InfoPanel.css';

interface InfoPanelProps {
  selectedHospital: Hospital | null;
  nearestAmbulance: NearestAmbulanceResult | null;
  onAmbulanceUpdate: () => void;
}

export default function InfoPanel({
  selectedHospital,
  nearestAmbulance,
  onAmbulanceUpdate,
}: InfoPanelProps) {
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    ambulanceId: '',
    latitude: '',
    longitude: '',
  });

  const handleUpdatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateForm.ambulanceId || !updateForm.latitude || !updateForm.longitude) {
      alert('Please fill in all fields');
      return;
    }

    const ambulanceId = parseInt(updateForm.ambulanceId);
    const lat = parseFloat(updateForm.latitude);
    const lng = parseFloat(updateForm.longitude);

    if (isNaN(ambulanceId) || ambulanceId < 1) {
      alert('Please enter a valid ambulance ID (1-5)');
      return;
    }

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }

    try {
      setUpdating(true);
      await updateAmbulancePosition(ambulanceId, lat, lng);
      setUpdateForm({ ambulanceId: '', latitude: '', longitude: '' });
      onAmbulanceUpdate();
      alert('Ambulance position updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update position';
      alert(`Error: ${errorMessage}`);
      console.error('Update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="info-panel">
      <h2>Information Panel</h2>

      {selectedHospital ? (
        <div className="hospital-info">
          <h3>Selected Hospital</h3>
          <p><strong>Name:</strong> {selectedHospital.name}</p>
          <p><strong>Address:</strong> {selectedHospital.address}</p>
          <p><strong>Coordinates:</strong> {selectedHospital.latitude.toFixed(6)}, {selectedHospital.longitude.toFixed(6)}</p>

          {nearestAmbulance ? (
            <div className="nearest-ambulance">
              <h3>Nearest Ambulance</h3>
              <p><strong>Identifier:</strong> {nearestAmbulance.nearestAmbulance.identifier}</p>
              <p><strong>Distance:</strong> {nearestAmbulance.nearestAmbulance.distance.toLocaleString()} meters</p>
              <p><strong>Coordinates:</strong> {nearestAmbulance.nearestAmbulance.latitude.toFixed(6)}, {nearestAmbulance.nearestAmbulance.longitude.toFixed(6)}</p>
              <p className="cache-info">
                <small>Query timestamp: {new Date(nearestAmbulance.timestamp).toLocaleTimeString()}</small>
              </p>
            </div>
          ) : (
            <div className="loading-nearest">
              <p>Calculating nearest ambulance...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="no-selection">
          <p>Click on a hospital marker on the map to find the nearest ambulance.</p>
        </div>
      )}

      <div className="update-section">
        <h3>Update Ambulance Position</h3>
        <form onSubmit={handleUpdatePosition}>
          <div className="form-group">
            <label>Ambulance ID (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={updateForm.ambulanceId}
              onChange={(e) => setUpdateForm({ ...updateForm, ambulanceId: e.target.value })}
              placeholder="e.g., 1"
              required
            />
          </div>
          <div className="form-group">
            <label>Latitude:</label>
            <input
              type="number"
              step="any"
              value={updateForm.latitude}
              onChange={(e) => setUpdateForm({ ...updateForm, latitude: e.target.value })}
              placeholder="e.g., 40.7128"
              required
            />
          </div>
          <div className="form-group">
            <label>Longitude:</label>
            <input
              type="number"
              step="any"
              value={updateForm.longitude}
              onChange={(e) => setUpdateForm({ ...updateForm, longitude: e.target.value })}
              placeholder="e.g., -74.0060"
              required
            />
          </div>
          <button type="submit" disabled={updating} className="update-btn">
            {updating ? 'Updating...' : 'Update Position'}
          </button>
        </form>
        <p className="help-text">
          <small>
            Updating an ambulance position will invalidate all proximity caches.
          </small>
        </p>
      </div>
    </div>
  );
}
