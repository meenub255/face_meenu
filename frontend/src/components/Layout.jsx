import React from 'react';
import logo from '../assets/logo.png';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 -z-10 bg-[var(--primary-bg)]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--primary-bg)] via-[var(--secondary-bg)] to-black opactiy-90"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-color)] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Glass Container */}
            <div className="glass-panel w-full max-w-md p-8 animate-fade-in relative z-10">
                <header className="mb-8 text-center flex flex-col items-center">
                    <img src={logo} alt="University Logo" className="h-16 mb-4 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform hover:scale-105" />
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-[var(--accent-color)] bg-clip-text text-transparent">
                        Attendance System
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">Secure Biometric Verification</p>
                </header>
                <main>
                    {children}
                </main>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-center text-xs text-[var(--text-secondary)] opacity-50 flex gap-4">
                <span>&copy; 2026 Attendance System</span>
                <span>•</span>
                <a href="/admin" className="hover:text-white transition-colors">Admin</a>
            </div>
        </div>
    );
};

export default Layout;
