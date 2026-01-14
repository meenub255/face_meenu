import React, { useState, useEffect } from 'react';
import { getLocations, createLocation, deleteLocation } from '../../api';

const LocationManager = () => {
    const [locations, setLocations] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', building: '', floor: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getLocations();
            setLocations(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createLocation(newItem);
            setNewItem({ name: '', building: '', floor: '' });
            loadData();
        } catch (err) {
            alert('Failed to create location');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this location?')) {
            try {
                await deleteLocation(id);
                loadData();
            } catch (err) {
                alert('Failed to delete location');
            }
        }
    };

    return (
        <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Manage Locations</h2>

            <form onSubmit={handleCreate} className="flex gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Room Name/Number"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Building"
                    value={newItem.building}
                    onChange={(e) => setNewItem({ ...newItem, building: e.target.value })}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Floor"
                    value={newItem.floor}
                    onChange={(e) => setNewItem({ ...newItem, floor: e.target.value })}
                    className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none"
                />
                <button type="submit" className="btn-primary">Add</button>
            </form>

            {loading ? <div>Loading...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Building</th>
                                <th className="p-3">Floor</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map((loc) => (
                                <tr key={loc.location_id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-3">{loc.location_id}</td>
                                    <td className="p-3 font-medium text-[var(--accent-color)]">{loc.name}</td>
                                    <td className="p-3">{loc.building}</td>
                                    <td className="p-3">{loc.floor}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => handleDelete(loc.location_id)} className="text-red-400 hover:text-red-300">Delete</button>
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

export default LocationManager;
