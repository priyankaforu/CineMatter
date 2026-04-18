import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        usermail: '',
        password: '',
        confirmPassword: ''
    });
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
    const handleSubmit = (e) => {
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
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="User name"
                        className={`${inputClass} pl-10`}
                    />
                </div>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input
                        name="usermail"
                        value={formData.usermail}
                        onChange={handleChange}
                        placeholder="hello@email.com"
                        className={`${inputClass} pl-10`}
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Type your password"
                        className={`${inputClass} pl-10`}
                        type={showPasswords.password ? "text" : "password"}
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400" onClick={() => togglePassword('password')}>
                        {showPasswords.password ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat the password"
                        className={`${inputClass} pl-10`}
                        type={showPasswords.confirmPassword ? "text" : "password"}
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400" onClick={() => togglePassword('confirmPassword')}>
                        {showPasswords.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                </div>
                <button type="submit" className="bg-yellow-800 p-3 mt-4 rounded-sm"> Sign up </button>
            </form>
            <div className="flex flex-row gap-2 justify-center">
                <span className="text-gray-400">Already have an account ?</span>
                <Link to="/login" className="underline text-yellow-400"> Login </Link>
            </div>
        </div>
    );
};

export default Signup;
