import { useState, useEffect, useCallback } from 'react';
import { Student, Location, Path, StudentFormData, StudentPosition } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { calculateExpectedReturnTime } from '../utils/timeUtils';
import { calculateStudentPosition } from '../utils/pathUtils';

export const DEFAULT_MAP_IMAGE = 'https://i.imgur.com/AjIj4wq.png';

// Initial data for demo purposes
const initialLocations: Location[] = [
  { id: 'classroom1', name: 'Potions Class', type: 'classroom', position: { x: 268, y: 1056 } },
  { id: 'classroom2', name: 'Transfiguration', type: 'classroom', position: { x: 602, y: 362 } },
  { id: 'classroom3', name: 'Defense Against Dark Arts', type: 'classroom', position: { x: 662, y: 717 } },
  { id: 'restroom1', name: 'First Floor Bathroom', type: 'restroom', position: { x: 271, y: 558 } },
  { id: 'restroom2', name: 'Second Floor Bathroom', type: 'restroom', position: { x: 271, y: 205 } },
];

const initialPaths: Path[] = [
  { 
    id: 'path1', 
    startLocationId: 'classroom1', 
    endLocationId: 'restroom1', 
    waypoints: [{ x: 268, y: 800 }, { x: 271, y: 700 }] 
  },
  { 
    id: 'path2', 
    startLocationId: 'classroom2', 
    endLocationId: 'restroom1', 
    waypoints: [{ x: 450, y: 460 }, { x: 350, y: 558 }] 
  },
  { 
    id: 'path3', 
    startLocationId: 'classroom2', 
    endLocationId: 'restroom2', 
    waypoints: [{ x: 450, y: 300 }, { x: 350, y: 205 }] 
  },
  { 
    id: 'path4', 
    startLocationId: 'classroom3', 
    endLocationId: 'restroom2', 
    waypoints: [{ x: 662, y: 500 }, { x: 450, y: 205 }] 
  },
];

export const useStudentData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [mapImage, setMapImage] = useState<string>(DEFAULT_MAP_IMAGE);
  const [paths, setPaths] = useState<Path[]>(initialPaths);
  const [studentPositions, setStudentPositions] = useState<Record<string, StudentPosition>>({});
  const [editingMap, setEditingMap] = useState(false);

  // Update student positions based on time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newPositions: Record<string, StudentPosition> = {};
      
      students.forEach(student => {
        const path = paths.find(p => p.id === student.pathId);
        if (path) {
          newPositions[student.id] = calculateStudentPosition(
            student, 
            path, 
            locations,
            now
          );
        }
      });
      
      setStudentPositions(newPositions);
    }, 100); // Update positions every 100ms for smooth animation
    
    return () => clearInterval(interval);
  }, [students, paths, locations]);

  // Add a new student with hall pass
  const addStudent = useCallback((data: StudentFormData) => {
    // Find appropriate path
    const path = paths.find(
      p => p.startLocationId === data.startLocationId && p.endLocationId === data.destinationId
    );
    
    if (!path) return;
    
    const destinationLocation = locations.find(loc => loc.id === data.destinationId);
    if (!destinationLocation) return;
    
    const now = Date.now();
    const expectedReturnTime = calculateExpectedReturnTime(now, destinationLocation.type);
    
    const newStudent: Student = {
      id: uuidv4(),
      name: data.name,
      startTime: now,
      expectedReturnTime,
      startLocationId: data.startLocationId,
      destinationId: data.destinationId,
      pathId: path.id,
      returned: false,
    };
    
    setStudents(prev => [...prev, newStudent]);
  }, [paths, locations]);

  // Mark a student as returned
  const markStudentReturned = useCallback((studentId: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, returned: true } 
          : student
      )
    );
  }, []);

  // Remove a student from tracking
  const removeStudent = useCallback((studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
  }, []);

  // Add a new location
  const addLocation = useCallback((location: Omit<Location, 'id'>) => {
    const newLocation: Location = {
      ...location,
      id: uuidv4(),
    };
    
    setLocations(prev => [...prev, newLocation]);
    return newLocation.id;
  }, []);

  // Update location position
  const updateLocationPosition = useCallback((locationId: string, position: { x: number; y: number }) => {
    setLocations(prev => 
      prev.map(loc => 
        loc.id === locationId 
          ? { ...loc, position } 
          : loc
      )
    );
  }, []);

  // Add a new path
  const addPath = useCallback((startLocationId: string, endLocationId: string, waypoints: { x: number; y: number }[]) => {
    const newPath: Path = {
      id: uuidv4(),
      startLocationId,
      endLocationId,
      waypoints,
    };
    
    setPaths(prev => [...prev, newPath]);
    return newPath.id;
  }, []);

  // Update path waypoints
  const updatePathWaypoints = useCallback((pathId: string, waypoints: { x: number; y: number }[]) => {
    setPaths(prev => 
      prev.map(path => 
        path.id === pathId 
          ? { ...path, waypoints } 
          : path
      )
    );
  }, []);

  // Get active and overdue students
  const getActiveStudents = useCallback(() => {
    return students.filter(student => !student.returned);
  }, [students]);

  const getOverdueStudents = useCallback(() => {
    const now = Date.now();
    return students.filter(student => 
      !student.returned && student.expectedReturnTime < now
    );
  }, [students]);

  return {
    students,
    locations,
    paths,
    studentPositions,
    mapImage,
    setMapImage,
    editingMap,
    setEditingMap,
    addStudent,
    markStudentReturned,
    removeStudent,
    addLocation,
    updateLocationPosition,
    addPath,
    updatePathWaypoints,
    getActiveStudents,
    getOverdueStudents,
  };
};