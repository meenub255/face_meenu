import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import UserList from './components/UserList';
import AttendanceList from './components/AttendanceList';
import AdminLogin from './components/AdminLogin';
import AdminRegister from './components/AdminRegister';
import Dashboard from './components/Dashboard';
import { isAdminLoggedIn } from './api';

import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
    return isAdminLoggedIn() ? children : <Navigate to="/admin/login" />;
};

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/register" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <UserList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/attendance"
                        element={
                            <ProtectedRoute>
                                <AttendanceList />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
