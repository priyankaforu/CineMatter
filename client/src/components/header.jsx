import { User } from 'lucide-react';
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
            <div className="flex gap-4 items-center">
                {token && !isTimeline && (
                    <Link to="/timeline" className="text-sm bg-yellow-700 hover:bg-yellow-600 px-4 py-1.5 rounded-md text-white transition">Timeline</Link>
                )}
                {token && isTimeline && (
                    <Link to="/friends" className="text-sm bg-yellow-700 hover:bg-yellow-600 px-4 py-1.5 rounded-md text-white transition">Friends</Link>
                )}
                {!isAuthPage && !isProfile && (token ? (
                    <Link to="/Profile">
                        <User className="text-gray-300 hover:text-white transition cursor-pointer" size={22} />
                    </Link>
                ) : (
                    <Link to="/login" className="text-sm bg-yellow-700 hover:bg-yellow-600 px-4 py-1.5 rounded-md text-white transition">Login</Link>
                ))}
                {isProfile && (
                    <Link to="/logout" className="text-sm bg-yellow-700 hover:bg-yellow-600 px-4 py-1.5 rounded-md text-white transition">Logout</Link>
                )}
            </div>
        </header>
    );
};

export default Header;
