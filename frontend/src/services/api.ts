import { Hospital, Ambulance, NearestAmbulanceResult } from '../types';

const API_BASE_URL = '/api';

export async function fetchHospitals(): Promise<Hospital[]> {
  const response = await fetch(`${API_BASE_URL}/hospitals`);
  if (!response.ok) {
    throw new Error('Failed to fetch hospitals');
  }
  return response.json();
}

export async function fetchAmbulances(): Promise<Ambulance[]> {
  const response = await fetch(`${API_BASE_URL}/ambulances`);
  if (!response.ok) {
    throw new Error('Failed to fetch ambulances');
  }
  return response.json();
}

export async function findNearestAmbulance(hospitalId: number): Promise<NearestAmbulanceResult> {
  const response = await fetch(`${API_BASE_URL}/proximity/hospital/${hospitalId}/nearest-ambulance`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to find nearest ambulance');
  }
  return response.json();
}

export async function updateAmbulancePosition(
  ambulanceId: number,
  latitude: number,
  longitude: number
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ambulances/${ambulanceId}/position`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latitude, longitude }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update ambulance position');
  }
}
