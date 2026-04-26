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

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-center text-sm mb-8">Sign in to your Cinematter account</p>

                    {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                name="userid"
                                value={formData.userid}
                                onChange={handleChange}
                                placeholder="Username or email"
                                className="w-full p-3 pl-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                                type={showPasswords.password ? "text" : "password"}
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400 cursor-pointer" onClick={() => togglePassword('password')}>
                                {showPasswords.password ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                        <button type="submit" className="bg-yellow-700 hover:bg-yellow-600 p-3 rounded-lg text-white font-medium transition cursor-pointer text-sm">
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="flex justify-between text-sm">
                            <Link to="/forgotpassword" className="text-gray-400 hover:text-white hover: underline transition">Forgot password?</Link>
                            <Link to="/signup" className="text-yellow-500 hover:text-yellow-400 transition">Create an account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
