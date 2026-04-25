import { Link } from 'react-router-dom';

const Logout = () => {
    localStorage.removeItem('token');
    return (
        <div className="flex h-screen mt-60 justify-center">
            <div className="flex flex-row gap-4">
                <div className="text-l">
                    You have logged out successfully
                </div>
                <Link to="/" className="text-l text-yellow-600 underline"> Go Back To Home Page</Link>
            </div>
        </div>
    )
}

export default Logout;
