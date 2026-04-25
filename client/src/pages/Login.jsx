import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userid: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({ password: false, confirmPassword: false });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const togglePassword = (field) => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.userid || !formData.password) {
            setError('All fields are required');
            return;
        }
        try {
            const res = await axios.post("http://localhost:3000/api/auth/login",
                {
                    user_id: formData.userid,
                    password: formData.password
                });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Login Failed');
        }

        console.log(formData);
    }

    const inputClass = "w-full p-3 rounded-lg border border-gray-500 bg-transparent text-white focus:border-yellow-400 focus:outline-none";
    return (
        <div className="flex flex-col items-center mt-6">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-6 w-full max-w-lg">
                {error && <p className="text-red-500">{error}</p>}
                <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input
                        name="userid"
                        value={formData.userid}
                        onChange={handleChange}
                        placeholder="User name or email id"
                        className={`${inputClass} pl-10 caret-white`}
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Type your password"
                        className={`${inputClass} pl-10 caret-white`}
                        type={showPasswords.password ? "text" : "password"}
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400" onClick={() => togglePassword('password')}>
                        {showPasswords.password ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                </div>
                <button type="submit" className="bg-yellow-800 p-3 mt-4 rounded-sm"> Login </button>
            </form>
            <div className="flex flex-row gap-2 justify-center">
                <Link to="/" className="text-gray-100 underline">Forgot Password ?</Link>
                <span className="text-gray-400"> or </span>
                <Link to="/signup" className="underline text-yellow-400"> Create an account </Link>
            </div>
        </div>
    );
};

export default Login;
