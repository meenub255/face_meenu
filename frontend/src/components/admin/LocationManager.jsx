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

            <form onSubmit={handleCreate} className="mb-8 bg-white/5 p-6 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Room Name/Number</label>
                        <input
                            type="text"
                            placeholder="e.g. Lab 101"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Building Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Science Block"
                            value={newItem.building}
                            onChange={(e) => setNewItem({ ...newItem, building: e.target.value })}
                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Floor Number</label>
                        <input
                            type="text"
                            placeholder="e.g. 1"
                            value={newItem.floor}
                            onChange={(e) => setNewItem({ ...newItem, floor: e.target.value })}
                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-[var(--accent-color)] outline-none text-white"
                        />
                    </div>
                </div>
                <button type="submit" className="btn-primary w-full md:w-auto px-8">Add Location</button>
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
