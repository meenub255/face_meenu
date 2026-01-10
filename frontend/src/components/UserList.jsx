import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../api';
import { Link } from 'react-router-dom';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                setUsers(users.filter(user => user.id !== id));
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className="flex flex-col items-center w-full animate-fade-in text-white">
            <h2 className="text-xl font-semibold mb-6 text-center">Admin: User Management</h2>

            {loading ? (
                <div className="text-center p-4">Loading users...</div>
            ) : error ? (
                <div className="text-red-400 p-4">{error}</div>
            ) : (
                <div className="w-full max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {users.length === 0 ? (
                        <p className="text-center text-gray-400">No users found.</p>
                    ) : (
                        <div className="space-y-3">
                            {users.map(user => (
                                <div key={user.id} className="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/10 hover:border-[var(--accent-color)] transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-lg">{user.name}</span>
                                        <span className="text-xs text-gray-400">ID: {user.id} • Registered: {new Date(user.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded hover:bg-red-500/40 transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="text-center w-full pt-6 mt-4 border-t border-[var(--glass-border)]">
                <Link to="/login" className="text-[var(--accent-color)] hover:text-white font-medium text-sm transition-colors">
                    Back to Login
                </Link>
            </div>
        </div>
    );
};

export default UserList;
