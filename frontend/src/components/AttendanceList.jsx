import React, { useEffect, useState } from 'react';
import { getAttendance, exportAttendance, getStudents } from '../api';
import { Link } from 'react-router-dom';

const AttendanceList = () => {
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [selectedStudent, setSelectedStudent] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadStudents();
        fetchAttendance();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students', err);
        }
    };

    const fetchAttendance = async (filters = {}) => {
        setLoading(true);
        try {
            const data = await getAttendance(filters);
            setAttendance(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        const filters = {};
        if (selectedStudent) filters.student_id = parseInt(selectedStudent);
        if (startDate) filters.start_date = new Date(startDate).toISOString();
        if (endDate) filters.end_date = new Date(endDate).toISOString();

        fetchAttendance(filters);
    };

    const handleExport = async () => {
        const filters = {};
        if (selectedStudent) filters.student_id = parseInt(selectedStudent);
        if (startDate) filters.start_date = new Date(startDate).toISOString();
        if (endDate) filters.end_date = new Date(endDate).toISOString();

        try {
            await exportAttendance(filters);
        } catch (err) {
            alert('Failed to export attendance');
        }
    };

    const handleReset = () => {
        setSelectedStudent('');
        setStartDate('');
        setEndDate('');
        fetchAttendance();
    };

    return (
        <div className="flex flex-col items-center w-full animate-fade-in text-white">
            <h2 className="text-xl font-semibold mb-6 text-center">Attendance Logs</h2>

            {/* Filters */}
            <div className="w-full mb-6 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[var(--accent-color)]"
                    >
                        <option value="">All Students</option>
                        {students.map(s => (
                            <option key={s.student_id} value={s.student_id}>{s.name} ({s.enrollment_number})</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[var(--accent-color)]"
                        placeholder="Start Date"
                    />

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[var(--accent-color)]"
                        placeholder="End Date"
                    />
                </div>

                <div className="flex gap-3">
                    <button onClick={handleFilter} className="btn-primary flex-1">
                        Apply Filters
                    </button>
                    <button onClick={handleReset} className="px-4 py-2 rounded-lg border border-[var(--glass-border)] hover:bg-white/5 transition-colors">
                        Reset
                    </button>
                    <button onClick={handleExport} className="px-4 py-2 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/40 transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center p-4">Loading attendance...</div>
            ) : error ? (
                <div className="text-red-400 p-4">{error}</div>
            ) : (
                <div className="w-full max-h-[50vh] overflow-y-auto overflow-x-auto pr-2 custom-scrollbar">
                    {attendance.length === 0 ? (
                        <p className="text-center text-gray-400">No attendance records found.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-[var(--primary-bg)] border-b border-white/10">
                                <tr>
                                    <th className="text-left p-3 font-semibold">Record ID</th>
                                    <th className="text-left p-3 font-semibold">Student</th>
                                    <th className="text-left p-3 font-semibold">Enrollment</th>
                                    <th className="text-left p-3 font-semibold">Date</th>
                                    <th className="text-left p-3 font-semibold">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map(record => {
                                    const date = record.timestamp ? new Date(record.timestamp) : null;
                                    return (
                                        <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-gray-400">{record.id}</td>
                                            <td className="p-3 font-medium text-white">{record.student_name}</td>
                                            <td className="p-3 font-mono text-[var(--accent-color)]">{record.enrollment_number}</td>
                                            <td className="p-3 text-gray-300">{date ? date.toLocaleDateString() : 'N/A'}</td>
                                            <td className="p-3 text-gray-300">{date ? date.toLocaleTimeString() : 'N/A'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <div className="text-center w-full pt-6 mt-4 border-t border-[var(--glass-border)]">
                <Link to="/admin" className="text-[var(--accent-color)] hover:text-white font-medium text-sm transition-colors">
                    Back to Admin
                </Link>
            </div>
        </div>
    );
};

export default AttendanceList;
