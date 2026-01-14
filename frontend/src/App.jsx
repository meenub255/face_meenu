import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';

import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
    // Admin check bypassed for now as per new schema requirements
    return children;
};

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/register" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    {/* Route /attendance is now part of /admin dashboard */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
