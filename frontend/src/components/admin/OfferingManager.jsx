import React, { useState, useEffect } from 'react';
import { getOfferings, createOffering, deleteOffering, getSubjects, getFaculty } from '../../api';

const OfferingManager = () => {
    const [offerings, setOfferings] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [newItem, setNewItem] = useState({
        subject_id: '', faculty_id: '', semester: '1', academic_year: '2025', batch: 'A'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [off, subj, fac] = await Promise.all([getOfferings(), getSubjects(), getFaculty()]);
        setOfferings(off);
        setSubjects(subj);
        setFaculty(fac);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newItem };
            payload.subject_id = parseInt(payload.subject_id);
            payload.faculty_id = parseInt(payload.faculty_id);
            payload.semester = parseInt(payload.semester);
            payload.academic_year = parseInt(payload.academic_year);

            await createOffering(payload);
            loadData();
        } catch (err) {
            alert('Failed to create offering');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this offering?')) {
            try {
                await deleteOffering(id);
                loadData();
            } catch (err) {
                alert('Failed to delete offering');
            }
        }
    };

    return (
        <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Manage Course Offerings</h2>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <select value={newItem.subject_id} onChange={e => setNewItem({ ...newItem, subject_id: e.target.value })} className="input-field text-white" required>
                    <option value="" className="text-black">Select Subject</option>
                    {subjects.map(s => <option key={s.subject_id} value={s.subject_id} className="text-black">{s.code} - {s.name}</option>)}
                </select>
                <select value={newItem.faculty_id} onChange={e => setNewItem({ ...newItem, faculty_id: e.target.value })} className="input-field text-white" required>
                    <option value="" className="text-black">Select Faculty</option>
                    {faculty.map(f => <option key={f.faculty_id} value={f.faculty_id} className="text-black">{f.name}</option>)}
                </select>
                <input type="number" placeholder="Sem" value={newItem.semester} onChange={e => setNewItem({ ...newItem, semester: e.target.value })} className="input-field" required />
                <input type="number" placeholder="Year" value={newItem.academic_year} onChange={e => setNewItem({ ...newItem, academic_year: e.target.value })} className="input-field" required />
                <input type="text" placeholder="Batch" value={newItem.batch} onChange={e => setNewItem({ ...newItem, batch: e.target.value })} className="input-field" required />

                <button type="submit" className="btn-primary col-span-1 md:col-span-1">Add Offering</button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Subject</th>
                            <th className="p-3">Faculty</th>
                            <th className="p-3">Sem/Year</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offerings.map(o => {
                            const subj = subjects.find(s => s.subject_id === o.subject_id);
                            const fac = faculty.find(f => f.faculty_id === o.faculty_id);
                            return (
                                <tr key={o.offering_id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-3">{o.offering_id}</td>
                                    <td className="p-3 font-medium text-white">{subj ? subj.name : o.subject_id}</td>
                                    <td className="p-3">{fac ? fac.name : o.faculty_id}</td>
                                    <td className="p-3">{o.semester} / {o.academic_year} ({o.batch})</td>
                                    <td className="p-3 text-right"><button onClick={() => handleDelete(o.offering_id)} className="text-red-400">Delete</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style>{`
                .input-field {
                    padding: 0.5rem 1rem;
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.5rem;
                    outline: none;
                }
                .input-field:focus {
                    border-color: var(--accent-color);
                }
            `}</style>
        </div>
    );
};

export default OfferingManager;
