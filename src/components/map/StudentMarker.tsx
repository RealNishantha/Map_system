import React from 'react';
import { Student } from '../../types';
import { formatTimeRemaining } from '../../utils/timeUtils';

interface StudentMarkerProps {
  student: Student;
  position: { x: number; y: number };
  status: 'on-time' | 'warning' | 'overdue';
}

export const StudentMarker: React.FC<StudentMarkerProps> = ({
  student,
  position,
  status,
}) => {
  // Status colors
  const statusColors = {
    'on-time': 'bg-green-600',
    'warning': 'bg-yellow-500',
    'overdue': 'bg-red-600',
  };
  
  // Status animations
  const statusAnimations = {
    'on-time': '',
    'warning': 'animate-pulse',
    'overdue': 'animate-bounce',
  };
  
  const timeRemaining = formatTimeRemaining(student.expectedReturnTime - Date.now());
  
  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30
                  transition-all duration-300 ease-in-out`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Student marker */}
      <div 
        className={`w-6 h-6 rounded-full ${statusColors[status]} ${statusAnimations[status]} 
                    flex items-center justify-center text-white text-xs font-bold shadow-md
                    border-2 border-white`}
        title={`${student.name} - ${timeRemaining}`}
      >
        {student.name[0]}
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-7 left-1/2 transform -translate-x-1/2
                      bg-white/90 p-1 rounded shadow-md text-xs w-max
                      opacity-0 hover:opacity-100 focus:opacity-100
                      transition-opacity duration-200 pointer-events-none
                      group-hover:opacity-100">
        <p className="font-bold">{student.name}</p>
        <p className={`text-${status === 'on-time' ? 'green' : status === 'warning' ? 'yellow' : 'red'}-600`}>
          {timeRemaining}
        </p>
      </div>
    </div>
  );
};