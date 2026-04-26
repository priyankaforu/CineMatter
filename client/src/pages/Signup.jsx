import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import languages from '../utils/languages.json';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';


const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        usermail: '',
        password: '',
        confirmPassword: '',
        preferredLang: 'te',
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({ password: false, confirmPassword: false });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const togglePassword = (field) => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.usermail || !formData.password) {
            setError('All fields are required');
            return;
        }

        if (!isValidEmail(formData.usermail)) {
            setError('Please enter a valid email');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords are not matching');
            return;
        }
        if (formData.password.length <= 8) {
            setError('Password should be atleast 8 characters long');
            return;
        }

        try {
            await axios.post('http://localhost:3000/api/auth/signup', {
                user_name: formData.username,
                user_mail: formData.usermail,
                password: formData.password,
                preferred_lang: formData.preferredLang
            })
            toast.success("Account created! Please Login");
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || 'Signup failed');
        }
    }

    {/*const inputClass = "w-full p-3 rounded-lg border border-gray-500 bg-transparent text-white focus:border-yellow-400 focus:outline-none";*/ }
    return (
        <div className="flex items-center justify-center min-h-[80vh] mt-10 mb-10">
            <div className="w-full max-w-xl">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
                    <p className="text-gray-400 text-center text-sm mb-8">Join Cinematter to discover and review movies</p>

                    {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div>
                            <label className="text-gray-400 text-xs mb-1 block">Username <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    className="w-full p-3 pl-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs mb-1 block">Email <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    name="usermail"
                                    value={formData.usermail}
                                    onChange={handleChange}
                                    placeholder="hello@email.com"
                                    className="w-full p-3 pl-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs mb-1 block">Password <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min 8 characters"
                                    className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                                    type={showPasswords.password ? "text" : "password"}
                                />
                                <div className="absolute right-3 top-3.5 text-gray-400 cursor-pointer" onClick={() => togglePassword('password')}>
                                    {showPasswords.password ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs mb-1 block">Confirm Password <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repeat your password"
                                    className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                                    type={showPasswords.confirmPassword ? "text" : "password"}
                                />
                                <div className="absolute right-3 top-3.5 text-gray-400 cursor-pointer" onClick={() => togglePassword('confirmPassword')}>
                                    {showPasswords.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs mb-1 block">Preferred Language <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <select
                                    name="preferredLang"
                                    value={formData.preferredLang}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none text-sm appearance-none cursor-pointer"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.iso_639_1} value={lang.iso_639_1} className="bg-[#1a1a2e] text-white">
                                            {lang.english_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="bg-yellow-700 hover:bg-yellow-600 p-3 rounded-lg text-white font-medium transition cursor-pointer text-sm">
                            Create Account
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="flex justify-center gap-2 text-sm">
                            <span className="text-gray-400">Already have an account?</span>
                            <Link to="/login" className="text-yellow-500 hover:text-yellow-400 transition">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Signup;
