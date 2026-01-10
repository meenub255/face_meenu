import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import UserList from './components/UserList';
import AttendanceList from './components/AttendanceList';

import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/register" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<UserList />} />
                    <Route path="/attendance" element={<AttendanceList />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
