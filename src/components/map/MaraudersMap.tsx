import React, { useState } from 'react';
import { MapView } from './MapView';
import { StudentForm } from '../students/StudentForm';
import { ActivePasses } from '../students/ActivePasses';
import { ListView } from '../students/ListView';
import { useStudentData, DEFAULT_MAP_IMAGE } from '../../hooks/useStudentData';
import { Map as MapSprite, Settings, ListFilter, Map } from 'lucide-react';

enum TabType {
  MAP = 'map',
  LIST = 'list',
  ACTIVE = 'active',
}

export const MaraudersMap: React.FC = () => {
  const studentData = useStudentData();
  const [activeTab, setActiveTab] = useState<TabType>(TabType.MAP);

  return (
    <div className="min-h-screen bg-amber-50 text-stone-800 flex flex-col">
      {/* Header */}
      <header className="bg-amber-900/80 text-amber-50 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapSprite className="h-8 w-8" />
            <h1 className="text-2xl font-semibold">Marauder's Map</h1>
          </div>
          <button 
            onClick={() => studentData.setEditingMap(!studentData.editingMap)}
            className={`p-2 rounded-full ${
              studentData.editingMap ? 'bg-amber-700 text-amber-50' : 'bg-amber-100/20 text-amber-50'
            } hover:bg-amber-700 transition-colors`}
            title={studentData.editingMap ? "Exit Map Editor" : "Edit Map"}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-6">
        {/* Left Column - Main Content */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          {/* Tabs */}
          <div className="bg-stone-200 rounded-lg flex overflow-hidden">
            <button 
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === TabType.MAP ? 'bg-amber-800 text-amber-50' : 'hover:bg-stone-300'
              }`}
              onClick={() => setActiveTab(TabType.MAP)}
            >
              <Map className="h-4 w-4" />
              <span>Map View</span>
            </button>
            <button
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === TabType.LIST ? 'bg-amber-800 text-amber-50' : 'hover:bg-stone-300'
              }`}
              onClick={() => setActiveTab(TabType.LIST)}
            >
              <ListFilter className="h-4 w-4" />
              <span>List View</span>
            </button>
            <button
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === TabType.ACTIVE ? 'bg-amber-800 text-amber-50' : 'hover:bg-stone-300'
              }`}
              onClick={() => setActiveTab(TabType.ACTIVE)}
            >
              <span className="relative">
                <MapSprite className="h-4 w-4" />
                {studentData.getActiveStudents().length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                    {studentData.getActiveStudents().length}
                  </span>
                )}
              </span>
              <span>Active</span>
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="flex-1 bg-amber-100/50 rounded-lg shadow-md p-4 min-h-[500px]">
            {activeTab === TabType.MAP && (
              <MapView 
                students={studentData.students}
                locations={studentData.locations}
                paths={studentData.paths}
                studentPositions={studentData.studentPositions}
                editingMap={studentData.editingMap}
                mapImage={studentData.mapImage}
                updateLocationPosition={studentData.updateLocationPosition}
                updatePathWaypoints={studentData.updatePathWaypoints}
              />
            )}
            {activeTab === TabType.LIST && (
              <ListView 
                students={studentData.students}
                locations={studentData.locations}
                markStudentReturned={studentData.markStudentReturned}
                removeStudent={studentData.removeStudent}
              />
            )}
            {activeTab === TabType.ACTIVE && (
              <ActivePasses 
                students={studentData.getActiveStudents()}
                locations={studentData.locations}
                markStudentReturned={studentData.markStudentReturned}
              />
            )}
          </div>
        </div>

        {/* Right Column - Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="bg-amber-100/50 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4 text-amber-900">Issue New Hall Pass</h2>
            <StudentForm 
              locations={studentData.locations}
              paths={studentData.paths}
              onAddStudent={studentData.addStudent}
            />
          </div>

          <div className="bg-amber-100/50 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2 text-amber-900">Statistics</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="text-sm text-amber-800">Active Passes</p>
                <p className="text-2xl font-bold text-amber-900">{studentData.getActiveStudents().length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-md">
                <p className="text-sm text-red-800">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{studentData.getOverdueStudents().length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-md">
                <p className="text-sm text-green-800">Returned</p>
                <p className="text-2xl font-bold text-green-900">
                  {studentData.students.filter(s => s.returned).length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-md">
                <p className="text-sm text-blue-800">Total</p>
                <p className="text-2xl font-bold text-blue-900">{studentData.students.length}</p>
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="bg-amber-100/50 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2 text-amber-900">Map Background</h2>
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Enter map image URL"
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={studentData.mapImage}
                onChange={(e) => studentData.setMapImage(e.target.value)}
              />
              <button
                onClick={() => studentData.setMapImage(DEFAULT_MAP_IMAGE)}
                className="w-full px-3 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>

          <div className="bg-amber-100/50 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2 text-amber-900">Map Legend</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                <span>Classroom</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <span>Restroom</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <span>On-time Student</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>Warning (&lt; 30s remaining)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span>Overdue Student</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-amber-900/80 text-amber-50/80 p-3 text-center text-sm">
        <p>Marauder's Map Hall Pass Tracking System © 2025</p>
      </footer>
    </div>
  );
};