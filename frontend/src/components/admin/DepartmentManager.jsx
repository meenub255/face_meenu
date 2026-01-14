import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, deleteDepartment } from '../../api';

const DepartmentManager = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ name: '', code: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createDepartment(newItem);
            setNewItem({ name: '', code: '' });
            loadData();
        } catch (err) {
            alert('Failed to create department');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this department?')) {
            try {
                await deleteDepartment(id);
                loadData();
            } catch (err) {
                alert('Failed to delete department');
            }
        }
    };

    return (
        <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Manage Departments</h2>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="flex gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Department Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Dept Code (e.g. CSE)"
                    value={newItem.code}
                    onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                    className="w-48 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none"
                    required
                />
                <button type="submit" className="btn-primary">Add Department</button>
            </form>

            {/* List */}
            {loading ? <div>Loading...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Code</th>
                                <th className="p-3">Name</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept) => (
                                <tr key={dept.dept_id || dept.department_id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-3">{dept.dept_id || dept.department_id}</td>
                                    <td className="p-3 font-mono text-[var(--accent-color)]">{dept.code}</td>
                                    <td className="p-3">{dept.name}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => handleDelete(dept.dept_id || dept.department_id)} className="text-red-400 hover:text-red-300">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DepartmentManager;
