import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const isAuthPage = location.pathname == "/login" || location.pathname == "/signup"
    return (
        <header className="flex items-center justify-between px-6 py-4">
            <Link to="/" className="text-xl font-bold text-white">Cinematter</Link >
            {!isAuthPage && (token ?
                (<User className="text-white cursor-pointer" size={24} />) : (<Link to="/login" className="text-l bg-yellow-800 px-4 py-1 rounded-sm">Login</Link>))}
        </header>
    );
};

export default Header;
