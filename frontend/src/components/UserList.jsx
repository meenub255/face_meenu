import React, { useEffect, useState } from 'react';
import { getStudents, deleteStudent } from '../api';

const UserList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Failed to load students", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await deleteStudent(id);
                setStudents(students.filter(s => s.student_id !== id));
            } catch (error) {
                console.error("Failed to delete student", error);
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Registered Students
            </h2>

            <div className="glass-panel overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 uppercase text-xs tracking-wider text-gray-300">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Enrollment No.</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400">No students found.</td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.student_id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-gray-300">{student.student_id}</td>
                                    <td className="p-4 font-mono text-[var(--accent-color)]">{student.enrollment_number}</td>
                                    <td className="p-4 font-medium text-white">{student.name}</td>
                                    <td className="p-4 text-gray-300 relative">
                                        <span className={`px-2 py-1 rounded text-xs ${student.enrollment_type === 'FT' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                            {student.enrollment_type === 'FT' ? 'Full Time' : 'Part Time'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(student.student_id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded transition-colors text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;
