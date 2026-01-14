import React, { useState, useEffect } from 'react';
import { getFaculty, createFaculty, deleteFaculty, getDepartments } from '../../api';

const FacultyManager = () => {
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '', employee_id: '', email: '', category: 'TEACHING', dept_id: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [fac, depts] = await Promise.all([getFaculty(), getDepartments()]);
            setFaculty(fac);
            setDepartments(depts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Convert dept_id to int if present
            const payload = { ...newItem };
            if (payload.dept_id) payload.dept_id = parseInt(payload.dept_id);

            await createFaculty(payload);
            setNewItem({ name: '', employee_id: '', email: '', category: 'TEACHING', dept_id: '' });
            loadData();
        } catch (err) {
            alert('Failed to create faculty');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this faculty member?')) {
            try {
                await deleteFaculty(id);
                loadData();
            } catch (err) {
                alert('Failed to delete faculty');
            }
        }
    };

    return (
        <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Manage Faculty</h2>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Employee ID"
                    value={newItem.employee_id}
                    onChange={(e) => setNewItem({ ...newItem, employee_id: e.target.value })}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={newItem.email}
                    onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none"
                />

                <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white"
                >
                    <option value="TEACHING" className="text-black">Teaching</option>
                    <option value="NON_TEACHING" className="text-black">Non-Teaching</option>
                </select>

                <select
                    value={newItem.dept_id}
                    onChange={(e) => setNewItem({ ...newItem, dept_id: e.target.value })}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white"
                >
                    <option value="" className="text-black">Select Department</option>
                    {departments.map(d => (
                        <option key={d.dept_id || d.department_id} value={d.dept_id || d.department_id} className="text-black">
                            {d.name}
                        </option>
                    ))}
                </select>

                <button type="submit" className="btn-primary">Add Faculty</button>
            </form>

            {loading ? <div>Loading...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Emp ID</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Dept</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculty.map((f) => {
                                const dept = departments.find(d => (d.dept_id || d.department_id) === f.dept_id);
                                return (
                                    <tr key={f.faculty_id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-3">{f.faculty_id}</td>
                                        <td className="p-3 font-medium text-white">{f.name}</td>
                                        <td className="p-3 font-mono text-[var(--accent-color)]">{f.employee_id}</td>
                                        <td className="p-3 text-xs uppercase">{f.category}</td>
                                        <td className="p-3 text-gray-300">{dept ? dept.code : '-'}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleDelete(f.faculty_id)} className="text-red-400 hover:text-red-300">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FacultyManager;
