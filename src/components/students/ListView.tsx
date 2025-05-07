import React, { useState } from 'react';
import { Student, Location } from '../../types';
import { getStatus, formatTimeRemaining } from '../../utils/timeUtils';
import { CheckCircle, Trash2, Search, Clock, AlertTriangle } from 'lucide-react';

interface ListViewProps {
  students: Student[];
  locations: Location[];
  markStudentReturned: (studentId: string) => void;
  removeStudent: (studentId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  students,
  locations,
  markStudentReturned,
  removeStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('all');
  
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-stone-600">
        <Clock className="h-12 w-12 mb-4 text-amber-600" />
        <p className="text-lg">No hall pass records yet</p>
        <p className="text-sm">Issue a hall pass to see records here</p>
      </div>
    );
  }
  
  // Filter students
  const filteredStudents = students.filter(student => {
    // Text search
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !student.returned) ||
      (filter === 'returned' && student.returned);
    
    return matchesSearch && matchesFilter;
  });
  
  // Sort students: active first (with overdue at top), then returned by time
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    // First put active before returned
    if (!a.returned && b.returned) return -1;
    if (a.returned && !b.returned) return 1;
    
    // For active students, sort by status (overdue first)
    if (!a.returned && !b.returned) {
      const aStatus = getStatus(a.expectedReturnTime);
      const bStatus = getStatus(b.expectedReturnTime);
      
      if (aStatus === 'overdue' && bStatus !== 'overdue') return -1;
      if (aStatus !== 'overdue' && bStatus === 'overdue') return 1;
      
      return a.expectedReturnTime - b.expectedReturnTime;
    }
    
    // For returned students, sort by most recent
    return b.startTime - a.startTime;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-stone-500" />
          </div>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        
        <div className="flex rounded-md overflow-hidden border border-stone-300">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'active'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('returned')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'returned'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            Returned
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Locations
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {sortedStudents.map(student => {
              const startLocation = locations.find(loc => loc.id === student.startLocationId);
              const destination = locations.find(loc => loc.id === student.destinationId);
              const status = getStatus(student.expectedReturnTime);
              const timeRemaining = formatTimeRemaining(student.expectedReturnTime - Date.now());
              
              if (!startLocation || !destination) return null;
              
              const timeLabel = student.returned 
                ? 'Returned' 
                : timeRemaining;
              
              return (
                <tr key={student.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-stone-900">{student.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-stone-600">
                      {startLocation.name} → {destination.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-stone-600">
                      {new Date(student.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {student.returned ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Returned
                        </span>
                      ) : status === 'on-time' ? (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {timeLabel}
                        </span>
                      ) : status === 'warning' ? (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {timeLabel}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {timeLabel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    {!student.returned ? (
                      <button
                        onClick={() => markStudentReturned(student.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                        title="Mark as returned"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => removeStudent(student.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Remove record"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredStudents.length === 0 && (
        <div className="text-center py-6 bg-white rounded-lg shadow">
          <p className="text-stone-600">No records found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};