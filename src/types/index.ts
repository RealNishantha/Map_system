export interface Location {
  id: string;
  name: string;
  type: 'classroom' | 'restroom';
  position: { x: number; y: number };
}

export interface Path {
  id: string;
  startLocationId: string;
  endLocationId: string;
  waypoints: { x: number; y: number }[];
}

export interface Student {
  id: string;
  name: string;
  startTime: number;
  expectedReturnTime: number;
  startLocationId: string;
  destinationId: string;
  pathId: string;
  returned: boolean;
  position?: { x: number; y: number };
}

export interface StudentFormData {
  name: string;
  startLocationId: string;
  destinationId: string;
}

export interface StudentPosition {
  position: { x: number; y: number };
  progress: number;
}