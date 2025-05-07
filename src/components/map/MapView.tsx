import React, { useRef, useState, useEffect } from 'react';
import { Student, Location, Path, StudentPosition } from '../../types';
import { StudentMarker } from './StudentMarker';
import { PathAnimation } from './PathAnimation';
import { getStatus } from '../../utils/timeUtils';
import { Pencil, X } from 'lucide-react';

interface MapViewProps {
  students: Student[];
  locations: Location[];
  paths: Path[];
  studentPositions: Record<string, StudentPosition>;
  editingMap: boolean;
  mapImage: string;
  updateLocationPosition: (locationId: string, position: { x: number; y: number }) => void;
  updatePathWaypoints: (pathId: string, waypoints: { x: number; y: number }[]) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  students,
  locations,
  paths,
  studentPositions,
  editingMap,
  mapImage,
  updateLocationPosition,
  updatePathWaypoints,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [draggingLocation, setDraggingLocation] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState({ width: 600, height: 400 });
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [pathWaypoints, setPathWaypoints] = useState<{ x: number; y: number }[]>([]);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<number | null>(null);
  
  // Update map size based on container
  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        setMapSize({
          width: mapRef.current.clientWidth,
          height: 500, // Fixed height or you can make it dynamic
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Handle mouse down on location
  const handleLocationMouseDown = (locationId: string, e: React.MouseEvent) => {
    if (!editingMap) {
      setSelectedLocation(locationId === selectedLocation ? null : locationId);
      return;
    }
    
    e.preventDefault();
    setDraggingLocation(locationId);
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!editingMap || !draggingLocation || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update location position
    updateLocationPosition(draggingLocation, { x, y });
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setDraggingLocation(null);
  };
  
  // Handle path editing
  const handleMapClick = (e: React.MouseEvent) => {
    if (!editingPath || !mapRef.current) return;
    e.stopPropagation();
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPathWaypoints(prev => [...prev, { x, y }]);
    // Add new waypoint at clicked position
    if (hoveredWaypoint !== null) {
      // Insert at hovered position
      setPathWaypoints(prev => [
        ...prev.slice(0, hoveredWaypoint + 1),
        { x, y },
        ...prev.slice(hoveredWaypoint + 1)
      ]);
    } else {
      // Add to end
      setPathWaypoints(prev => [...prev, { x, y }]);
    }
  };
  
  const handleWaypointDrag = (index: number, e: React.MouseEvent) => {
    if (!mapRef.current) return;
    e.stopPropagation();
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPathWaypoints(prev => prev.map((wp, i) => 
      i === index ? { x, y } : wp
    ));
  };

  const handleWaypointDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPathWaypoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinishPathEdit = () => {
    if (editingPath) {
      updatePathWaypoints(editingPath, pathWaypoints);
    }
    setEditingPath(null);
    setPathWaypoints([]);
    setHoveredWaypoint(null);
  };
  
  // Get active students
  const activeStudents = students.filter(student => !student.returned);
  
  return (
    <div 
      ref={mapRef}
      className={`relative w-full h-full bg-amber-50 rounded-lg border-2 ${
        editingMap ? 'border-amber-600 cursor-move' : 'border-amber-200'
      } overflow-hidden`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        if (editingPath) handleFinishPathEdit();
      }}
      onClick={handleMapClick}
    >
      {/* Parchment texture background */}
      <div 
        className="absolute inset-0 bg-cover opacity-10"
        style={{ backgroundImage: `url(${mapImage})` }}
      ></div>
      
      {/* Map title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
        <h2 className="text-xl font-bold text-amber-900">Hogwarts School Map</h2>
        {editingMap && (
          <p className="text-sm text-amber-700 animate-pulse">Editing Mode: Drag locations to reposition</p>
        )}
      </div>
      
      {/* Draw paths */}
      {paths.map(path => {
        const startLocation = locations.find(loc => loc.id === path.startLocationId);
        const endLocation = locations.find(loc => loc.id === path.endLocationId);
        
        if (!startLocation || !endLocation) return null;
        
        const fullPath = [
          startLocation.position,
          ...path.waypoints,
          endLocation.position
        ];
        
        const isEditing = editingPath === path.id;
        const currentPath = isEditing ? [...fullPath, ...pathWaypoints] : fullPath;
        
        return (
          <div key={path.id} className="absolute inset-0">
            <svg className="absolute inset-0 pointer-events-none">
              <polyline
                points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={isEditing ? '#f59e0b' : '#78716c'}
                strokeWidth={isEditing ? 3 : 2}
                strokeDasharray={isEditing ? '' : '4,4'}
                strokeOpacity={isEditing ? 0.8 : 0.5}
              />
            </svg>
            {isEditing && pathWaypoints.map((point, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: point.x, top: point.y }}
                onMouseEnter={() => setHoveredWaypoint(index)}
                onMouseLeave={() => setHoveredWaypoint(null)}
              >
                <div 
                  className="w-4 h-4 bg-amber-500 rounded-full cursor-move shadow-md
                           hover:scale-125 transition-transform"
                  onMouseDown={(e) => {
                    const handleMove = (moveEvent: MouseEvent) => {
                      handleWaypointDrag(index, moveEvent as unknown as React.MouseEvent);
                    };
                    const handleUp = () => {
                      document.removeEventListener('mousemove', handleMove);
                      document.removeEventListener('mouseup', handleUp);
                    };
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleUp);
                  }}
                />
                <button
                  onClick={(e) => handleWaypointDelete(index, e)}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full
                           opacity-0 group-hover:opacity-100 transition-opacity
                           flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {editingMap && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (editingPath === path.id) {
                    handleFinishPathEdit();
                  } else {
                    setEditingPath(path.id);
                    setPathWaypoints([]);
                  }
                }}
                className={`absolute p-1 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 ${
                  isEditing ? 'bg-amber-600 text-white' : 'bg-white text-amber-600'
                } hover:scale-110 transition-all`}
                style={{
                  left: `${(startLocation.position.x + endLocation.position.x) / 2}px`,
                  top: `${(startLocation.position.y + endLocation.position.y) / 2}px`,
                }}
              >
                {isEditing ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        );
      })}
      
      {/* Draw student paths animations */}
      {activeStudents.map(student => {
        const position = studentPositions[student.id];
        const path = paths.find(p => p.id === student.pathId);
        
        if (!position || !path) return null;
        
        return (
          <PathAnimation
            key={`path-${student.id}`}
            student={student}
            path={path}
            locations={locations}
            progress={position.progress}
          />
        );
      })}
      
      {/* Draw locations */}
      {locations.map(location => (
        <div
          key={location.id}
          className={`absolute p-2 transform -translate-x-1/2 -translate-y-1/2 ${
            location.type === 'classroom' 
              ? 'bg-amber-600 text-white' 
              : 'bg-blue-600 text-white'
          } ${
            selectedLocation === location.id 
              ? 'ring-4 ring-yellow-300 z-20' 
              : editingMap ? 'cursor-move z-10' : 'cursor-pointer'
          } rounded-full h-10 w-10 flex items-center justify-center shadow-md
            transition-all hover:scale-110`}
          style={{
            left: `${location.position.x}px`,
            top: `${location.position.y}px`,
          }}
          onMouseDown={(e) => handleLocationMouseDown(location.id, e)}
          title={location.name}
        >
          <span className="text-xs font-bold truncate max-w-[32px]">
            {location.name.split(' ')[0][0]}
          </span>
        </div>
      ))}
      
      {/* Location popup */}
      {selectedLocation && (
        <div className="absolute p-2 bg-white rounded-md shadow-lg z-30"
          style={{
            left: `${locations.find(l => l.id === selectedLocation)?.position.x}px`,
            top: `${(locations.find(l => l.id === selectedLocation)?.position.y || 0) + 30}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <h3 className="font-bold text-sm">
            {locations.find(l => l.id === selectedLocation)?.name}
          </h3>
          <p className="text-xs text-gray-600">
            {locations.find(l => l.id === selectedLocation)?.type}
          </p>
          <div className="text-xs mt-1">
            <p>Students: {students.filter(s => 
              (s.startLocationId === selectedLocation || s.destinationId === selectedLocation) 
              && !s.returned
            ).length}</p>
          </div>
        </div>
      )}
      
      {/* Draw students */}
      {activeStudents.map(student => {
        const position = studentPositions[student.id];
        if (!position) return null;
        
        const status = getStatus(student.expectedReturnTime);
        
        return (
          <StudentMarker
            key={student.id}
            student={student}
            position={position.position}
            status={status}
          />
        );
      })}
      
      {/* Editing mode overlay */}
      {editingMap && (
        <div className="absolute bottom-4 right-4 bg-amber-800 text-white p-2 rounded-md shadow-lg">
          <p className="text-sm">Drag locations to reposition</p>
        </div>
      )}
    </div>
  );
};