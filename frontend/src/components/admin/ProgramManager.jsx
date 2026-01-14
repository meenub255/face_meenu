import React, { useState, useEffect } from 'react';
import { getPrograms, createProgram, deleteProgram, getSubjects, createSubject, deleteSubject, getDepartments } from '../../api';

const ProgramManager = () => {
    const [programs, setPrograms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Tabbed interface internal to this manager
    const [subTab, setSubTab] = useState('programs'); // programs | subjects

    const [newProgram, setNewProgram] = useState({ name: '', code: '', dept_id: '' });
    const [newSubject, setNewSubject] = useState({ name: '', code: '', dept_id: '', semester: 1, credits: 3 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [prog, subj, depts] = await Promise.all([getPrograms(), getSubjects(), getDepartments()]);
        setPrograms(prog);
        setSubjects(subj);
        setDepartments(depts);
    };

    const handleCreateProgram = async (e) => {
        e.preventDefault();
        try {
            await createProgram({ ...newProgram, dept_id: parseInt(newProgram.dept_id) });
            setNewProgram({ name: '', code: '', dept_id: '' });
            loadData();
        } catch (err) { alert('Failed to create program'); }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            await createSubject({ ...newSubject, dept_id: parseInt(newSubject.dept_id) });
            setNewSubject({ name: '', code: '', dept_id: '', semester: 1, credits: 3 });
            loadData();
        } catch (err) { alert('Failed to create subject'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setSubTab('programs')}
                    className={`px-4 py-2 ${subTab === 'programs' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'text-gray-400'}`}
                >
                    Programs
                </button>
                <button
                    onClick={() => setSubTab('subjects')}
                    className={`px-4 py-2 ${subTab === 'subjects' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'text-gray-400'}`}
                >
                    Subjects
                </button>
            </div>

            {subTab === 'programs' && (
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4">Manage Programs</h3>
                    <form onSubmit={handleCreateProgram} className="mb-8 bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Program Name</label>
                                <input type="text" placeholder="e.g. B.Tech CSE" value={newProgram.name} onChange={e => setNewProgram({ ...newProgram, name: e.target.value })} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Program Code</label>
                                <input type="text" placeholder="e.g. BT-CSE" value={newProgram.code} onChange={e => setNewProgram({ ...newProgram, code: e.target.value })} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                                <select value={newProgram.dept_id} onChange={e => setNewProgram({ ...newProgram, dept_id: e.target.value })} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white" required>
                                    <option value="" className="text-gray-500">Select Department</option>
                                    {departments.map(d => <option key={d.dept_id || d.department_id} value={d.dept_id || d.department_id} className="text-black">{d.code} - {d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full md:w-auto px-8">Add Program</button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400"><tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3 text-right">Actions</th></tr></thead>
                            <tbody>
                                {programs.map(p => (
                                    <tr key={p.program_id} className="border-b border-white/5">
                                        <td className="p-3 font-mono text-[var(--accent-color)]">{p.code}</td>
                                        <td className="p-3">{p.name}</td>
                                        <td className="p-3 text-right"><button onClick={async () => { await deleteProgram(p.program_id); loadData(); }} className="text-red-400">Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {subTab === 'subjects' && (
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4">Manage Subjects</h3>
                    <form onSubmit={handleCreateSubject} className="mb-8 bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-4">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Subject Name</label>
                                <input type="text" placeholder="e.g. Data Structures" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Subject Code</label>
                                <input type="text" placeholder="e.g. CS101" value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                                <select value={newSubject.dept_id} onChange={e => setNewSubject({ ...newSubject, dept_id: e.target.value })} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white" required>
                                    <option value="" className="text-gray-500">Select Dept</option>
                                    {departments.map(d => <option key={d.dept_id || d.department_id} value={d.dept_id || d.department_id} className="text-black">{d.code}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Semester</label>
                                <input type="number" placeholder="1" value={newSubject.semester} onChange={e => setNewSubject({ ...newSubject, semester: e.target.value })} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white" />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full md:w-auto px-8">Add Subject</button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400"><tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Credits</th><th className="p-3 text-right">Actions</th></tr></thead>
                            <tbody>
                                {subjects.map(s => (
                                    <tr key={s.subject_id} className="border-b border-white/5">
                                        <td className="p-3 font-mono text-[var(--accent-color)]">{s.code}</td>
                                        <td className="p-3">{s.name}</td>
                                        <td className="p-3">{s.credits}</td>
                                        <td className="p-3 text-right"><button onClick={async () => { await deleteSubject(s.subject_id); loadData(); }} className="text-red-400">Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ProgramManager;
