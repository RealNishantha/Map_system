import React from 'react';
import { Student, Path, Location } from '../../types';

interface PathAnimationProps {
  student: Student;
  path: Path;
  locations: Location[];
  progress: number;
}

export const PathAnimation: React.FC<PathAnimationProps> = ({
  student,
  path,
  locations,
  progress,
}) => {
  const startLocation = locations.find(loc => loc.id === path.startLocationId);
  const endLocation = locations.find(loc => loc.id === path.endLocationId);
  
  if (!startLocation || !endLocation) return null;
  
  // Create full path
  const fullPath = [
    startLocation.position,
    ...path.waypoints,
    endLocation.position
  ];
  
  // Create segments for dash-array animation
  const totalLength = fullPath.reduce((total, point, index) => {
    if (index === 0) return 0;
    
    const prevPoint = fullPath[index - 1];
    const segmentLength = Math.sqrt(
      Math.pow(point.x - prevPoint.x, 2) +
      Math.pow(point.y - prevPoint.y, 2)
    );
    
    return total + segmentLength;
  }, 0);
  
  // Calculate stroke-dasharray and stroke-dashoffset based on progress
  const dashArray = `${totalLength} ${totalLength}`;
  const dashOffset = totalLength - (progress * totalLength);
  
  // Adjust based on direction (going to destination or returning)
  const direction = progress > 1 ? -1 : 1;
  const adjustedOffset = direction === 1 ? dashOffset : -dashOffset;
  
  return (
    <svg className="absolute inset-0 pointer-events-none z-20">
      {/* Path line */}
      <polyline
        points={fullPath.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="rgba(120, 113, 108, 0.3)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Animated footprints */}
      <polyline
        points={fullPath.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="url(#footprintPattern)"
        strokeWidth="8"
        strokeDasharray={dashArray}
        strokeDashoffset={adjustedOffset}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Footprint pattern definition */}
      <defs>
        <pattern
          id="footprintPattern"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="10" cy="10" r="3" fill="#78716C" />
        </pattern>
      </defs>
    </svg>
  );
};