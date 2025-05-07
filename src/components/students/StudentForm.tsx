import React, { useState, useMemo } from 'react';
import { Location, Path, StudentFormData } from '../../types';

interface StudentFormProps {
  locations: Location[];
  paths: Path[];
  onAddStudent: (data: StudentFormData) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  locations,
  paths,
  onAddStudent,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    startLocationId: '',
    destinationId: '',
  });
  
  const classrooms = useMemo(() => 
    locations.filter(loc => loc.type === 'classroom'),
    [locations]
  );
  
  const restrooms = useMemo(() => 
    locations.filter(loc => loc.type === 'restroom'),
    [locations]
  );
  
  // Check if a path exists between selected locations
  const pathExists = useMemo(() => {
    if (!formData.startLocationId || !formData.destinationId) return false;
    
    return paths.some(
      path => path.startLocationId === formData.startLocationId && 
             path.endLocationId === formData.destinationId
    );
  }, [formData.startLocationId, formData.destinationId, paths]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startLocationId || !formData.destinationId || !pathExists) {
      return;
    }
    
    onAddStudent(formData);
    setFormData({
      name: '',
      startLocationId: '',
      destinationId: '',
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Student Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Enter student name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Starting Classroom
        </label>
        <select
          name="startLocationId"
          value={formData.startLocationId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          required
        >
          <option value="">Select classroom</option>
          {classrooms.map(classroom => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Destination
        </label>
        <select
          name="destinationId"
          value={formData.destinationId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          required
        >
          <option value="">Select destination</option>
          {restrooms.map(restroom => (
            <option key={restroom.id} value={restroom.id}>
              {restroom.name}
            </option>
          ))}
        </select>
      </div>
      
      {formData.startLocationId && formData.destinationId && !pathExists && (
        <div className="text-red-600 text-sm">
          No path exists between these locations. Please select different locations or create a path.
        </div>
      )}
      
      <button
        type="submit"
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          formData.name && formData.startLocationId && formData.destinationId && pathExists
            ? 'bg-amber-600 text-white hover:bg-amber-700'
            : 'bg-stone-300 text-stone-500 cursor-not-allowed'
        }`}
        disabled={!formData.name || !formData.startLocationId || !formData.destinationId || !pathExists}
      >
        Issue Hall Pass
      </button>
    </form>
  );
};