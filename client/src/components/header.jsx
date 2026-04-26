import { User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const [token, setToken] = useState(localStorage.getItem('token'));
    const isAuthPage = location.pathname === "/login" || location.pathname == "/signup"
    const isProfile = location.pathname === "/Profile";
    const isTimeline = location.pathname === "/timeline";
    // const isLoggedOut = location.pathname == "/logout";
    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, [location])
    return (
        <header className="flex items-center justify-between px-10 py-5 bg-white/5 backdrop-blur-md">
            <Link to="/" className="text-xl font-bold text-white">Cinematter</Link>
            <div className="flex gap-8 items-center">
                {token && !isTimeline && (
                    <Link to="/timeline" className="text-md text-gray-300 hover:text-white hover:underline underline-offset-4 transition">Timeline</Link>
                )}
                {token && isTimeline && (
                    <Link to="/friends" className="text-md text-gray-300 hover:text-white hover: underline underline-offset-4 transition">Friends</Link>
                )}
                {!isAuthPage && !isProfile && (token ? (
                    <Link to="/Profile" className="relative text-sm bg-yellow-700 hover:bg-yellow-600 px-4 py-1.5 pl-9 rounded-md text-white transition">
                        <User size={16} className="absolute left-3 top-2" />
                        Profile
                    </Link>
                ) : (
                    <Link to="/login" className="text-sm bg-yellow-700 hover:bg-yellow-600 px-4 py-1.5 rounded-md text-white transition">Login</Link>
                ))}
                {isProfile && (
                    <Link to="/logout" className="relative text-sm bg-gray-700 hover:bg-red-800 px-4 py-1.5 pl-9 rounded-md text-white transition">
                        <LogOut size={16} className="absolute left-3 top-2" />
                        Logout
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
