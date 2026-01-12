import logo from '../assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAdminLoggedIn, logoutAdmin } from '../api';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const loggedIn = isAdminLoggedIn();

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 -z-10 bg-[var(--primary-bg)]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--primary-bg)] via-[var(--secondary-bg)] to-black opactiy-90"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-color)] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Admin Bar */}
            {loggedIn && (
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full text-xs animate-fade-in shadow-lg">
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/admin/dashboard')} className={`hover:text-white transition-colors py-1 px-3 rounded-full ${location.pathname === '/admin/dashboard' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-[var(--text-secondary)]'}`}>Dashboard</button>
                        <button onClick={() => navigate('/admin')} className={`hover:text-white transition-colors py-1 px-3 rounded-full ${location.pathname === '/admin' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-[var(--text-secondary)]'}`}>Users</button>
                        <button onClick={() => navigate('/attendance')} className={`hover:text-white transition-colors py-1 px-3 rounded-full ${location.pathname === '/attendance' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-[var(--text-secondary)]'}`}>Attendance</button>
                    </div>
                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors font-bold px-3">Logout</button>
                </div>
            )}

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
                {!loggedIn && (
                    <>
                        <span>•</span>
                        <button onClick={() => navigate('/admin/login')} className="hover:text-white transition-colors">Admin Login</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Layout;
