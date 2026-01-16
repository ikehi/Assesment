export interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Ambulance {
  id: number;
  identifier: string;
  latitude: number;
  longitude: number;
  status: string;
  updatedAt: string;
}

export interface NearestAmbulanceResult {
  hospitalId: number;
  nearestAmbulance: {
    id: number;
    identifier: string;
    distance: number;
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}
