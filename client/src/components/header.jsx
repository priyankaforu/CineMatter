import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="flex items-center justify-between px-6 py-4">
            <Link to="/" className="text-xl font-bold text-white">Cinematter</Link >
            <Link to="/login" className="text-l bg-yellow-400 px-4 py-2">Login</Link>
        </header>
    );
};

export default Header;
