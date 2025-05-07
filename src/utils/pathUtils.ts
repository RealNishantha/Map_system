import { Path, Location, StudentPosition } from '../types';

/**
 * Calculate position along a path based on progress (0-1)
 */
export const getPositionOnPath = (
  path: Path, 
  progress: number, 
  locations: Location[]
): { x: number; y: number } => {
  if (progress <= 0) {
    const startLocation = locations.find(loc => loc.id === path.startLocationId);
    return startLocation?.position || { x: 0, y: 0 };
  }
  
  if (progress >= 1) {
    const endLocation = locations.find(loc => loc.id === path.endLocationId);
    return endLocation?.position || { x: 0, y: 0 };
  }
  
  // Create a complete path including start and end locations
  const startLocation = locations.find(loc => loc.id === path.startLocationId);
  const endLocation = locations.find(loc => loc.id === path.endLocationId);
  
  if (!startLocation || !endLocation) {
    return { x: 0, y: 0 };
  }
  
  const fullPath = [
    startLocation.position,
    ...path.waypoints,
    endLocation.position
  ];
  
  // Calculate total path length
  let totalLength = 0;
  const segmentLengths: number[] = [];
  
  for (let i = 0; i < fullPath.length - 1; i++) {
    const segmentLength = Math.sqrt(
      Math.pow(fullPath[i + 1].x - fullPath[i].x, 2) + 
      Math.pow(fullPath[i + 1].y - fullPath[i].y, 2)
    );
    segmentLengths.push(segmentLength);
    totalLength += segmentLength;
  }
  
  // Find which segment we're on and the progress within that segment
  let targetDistance = progress * totalLength;
  let currentDistance = 0;
  
  for (let i = 0; i < segmentLengths.length; i++) {
    if (targetDistance <= currentDistance + segmentLengths[i]) {
      const segmentProgress = (targetDistance - currentDistance) / segmentLengths[i];
      return {
        x: fullPath[i].x + segmentProgress * (fullPath[i + 1].x - fullPath[i].x),
        y: fullPath[i].y + segmentProgress * (fullPath[i + 1].y - fullPath[i].y)
      };
    }
    currentDistance += segmentLengths[i];
  }
  
  // Fallback
  return endLocation.position;
};

/**
 * Calculate student position based on time
 */
export const calculateStudentPosition = (
  student: { startTime: number; expectedReturnTime: number; returned: boolean },
  path: Path,
  locations: Location[],
  currentTime: number
): StudentPosition => {
  if (student.returned) {
    const startLocation = locations.find(loc => loc.id === path.startLocationId);
    return { 
      position: startLocation?.position || { x: 0, y: 0 }, 
      progress: 0 
    };
  }
  
  const totalJourneyTime = student.expectedReturnTime - student.startTime;
  const elapsedTime = currentTime - student.startTime;
  
  // Create a parabolic movement: go to destination and come back
  let progress = elapsedTime / totalJourneyTime;
  
  // Ensure progress is between 0 and 1
  progress = Math.max(0, Math.min(1, progress));
  
  // If going to destination (first half)
  if (progress <= 0.3) {
    // Scale 0-0.3 to 0-1 for going to destination
    const scaledProgress = progress / 0.3;
    return {
      position: getPositionOnPath(path, scaledProgress, locations),
      progress: scaledProgress
    };
  } 
  // If at destination (middle part)
  else if (progress <= 0.7) {
    const endLocation = locations.find(loc => loc.id === path.endLocationId);
    return {
      position: endLocation?.position || { x: 0, y: 0 },
      progress: 1
    };
  } 
  // If returning (last half)
  else {
    // Scale 0.7-1 to 1-0 for returning
    const scaledProgress = 1 - ((progress - 0.7) / 0.3);
    return {
      position: getPositionOnPath(path, scaledProgress, locations),
      progress: 2 - scaledProgress // For animation direction
    };
  }
};