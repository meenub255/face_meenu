import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DepartmentManager from './admin/DepartmentManager';
import ProgramManager from './admin/ProgramManager';
import FacultyManager from './admin/FacultyManager';
import LocationManager from './admin/LocationManager';
import OfferingManager from './admin/OfferingManager';
import UserList from './UserList';
import AttendanceList from './AttendanceList';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('students');

    const tabs = [
        { id: 'students', label: 'Students' },
        { id: 'attendance', label: 'Attendance Logs' },
        { id: 'departments', label: 'Departments' },
        { id: 'programs', label: 'Programs & Subjects' },
        { id: 'faculty', label: 'Faculty' },
        { id: 'locations', label: 'Locations' },
        { id: 'offerings', label: 'Course Offerings' },
    ];

    return (
        <div className="flex flex-col w-full h-full animate-fade-in text-white">
            <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Administration Portal
            </h1>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white/5 p-2 rounded-xl border border-white/10 mx-auto max-w-6xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-[var(--accent-color)] text-white shadow-lg scale-105'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="w-full max-w-7xl mx-auto min-h-[60vh]">
                {activeTab === 'students' && <UserList />}
                {activeTab === 'attendance' && <AttendanceList />}
                {activeTab === 'departments' && <DepartmentManager />}
                {activeTab === 'programs' && <ProgramManager />}
                {activeTab === 'faculty' && <FacultyManager />}
                {activeTab === 'locations' && <LocationManager />}
                {activeTab === 'offerings' && <OfferingManager />}
            </div>

            <div className="text-center w-full pt-6 mt-4 border-t border-[var(--glass-border)]">
                <Link to="/login" className="text-[var(--accent-color)] hover:text-white font-medium text-sm transition-colors">
                    Back to Login
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
