import React from 'react';
import { Student, Location } from '../../types';
import { formatTimeRemaining, getStatus } from '../../utils/timeUtils';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface ActivePassesProps {
  students: Student[];
  locations: Location[];
  markStudentReturned: (studentId: string) => void;
}

export const ActivePasses: React.FC<ActivePassesProps> = ({
  students,
  locations,
  markStudentReturned,
}) => {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-stone-600">
        <Clock className="h-12 w-12 mb-4 text-amber-600" />
        <p className="text-lg">No active hall passes at the moment</p>
        <p className="text-sm">When students leave the classroom, they will appear here</p>
      </div>
    );
  }
  
  // Sort students: overdue first, then by time remaining
  const sortedStudents = [...students].sort((a, b) => {
    const aStatus = getStatus(a.expectedReturnTime);
    const bStatus = getStatus(b.expectedReturnTime);
    
    if (aStatus === 'overdue' && bStatus !== 'overdue') return -1;
    if (aStatus !== 'overdue' && bStatus === 'overdue') return 1;
    
    return a.expectedReturnTime - b.expectedReturnTime;
  });
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-amber-900">Active Hall Passes ({students.length})</h2>
      
      <div className="space-y-3">
        {sortedStudents.map(student => {
          const startLocation = locations.find(loc => loc.id === student.startLocationId);
          const destination = locations.find(loc => loc.id === student.destinationId);
          const status = getStatus(student.expectedReturnTime);
          const timeRemaining = formatTimeRemaining(student.expectedReturnTime - Date.now());
          
          if (!startLocation || !destination) return null;
          
          return (
            <div 
              key={student.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                status === 'on-time' 
                  ? 'border-green-500' 
                  : status === 'warning' 
                    ? 'border-yellow-500' 
                    : 'border-red-500'
              } transition-all`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{student.name}</h3>
                  <p className="text-sm text-stone-600">
                    {startLocation.name} → {destination.name}
                  </p>
                  <div className="flex items-center mt-2">
                    {status === 'on-time' ? (
                      <Clock className="h-4 w-4 text-green-600 mr-1" />
                    ) : status === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      status === 'on-time' 
                        ? 'text-green-600' 
                        : status === 'warning' 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {timeRemaining}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => markStudentReturned(student.id)}
                  className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded-md flex items-center text-sm font-medium transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Returned
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};