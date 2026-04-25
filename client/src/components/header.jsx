import { User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const [token, setToken] = useState(localStorage.getItem('token'));
    const isAuthPage = location.pathname == "/login" || location.pathname == "/signup"
    const isProfile = location.pathname == "/Profile";
    // const isLoggedOut = location.pathname == "/logout";
    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, [location])
    return (
        <header className="flex items-center justify-between px-6 py-4">
            <Link to="/" className="text-xl font-bold text-white">Cinematter</Link >
            {!isAuthPage && !isProfile && (token ?
                (<Link to="/Profile">{<User className="text-white cursor-pointer" size={24} />}</Link>) : (<Link to="/login" className="text-l bg-yellow-800 px-4 py-1 rounded-sm">Login</Link>))}
            {isProfile && (<Link to="/logout" className="text-l bg-yellow-800 px-4 py-1 rounded-sm">Logout</Link>)}
        </header>
    );
};

export default Header;
