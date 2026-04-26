import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const email = state?.email;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({ password: false, confirm: false });

    if (!email) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <p className="text-gray-400">Invalid access. Please verify your OTP first.</p>
            </div>
        );
    }

    const handleReset = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            setError('Both fields are required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        try {
            const res = await axios.put('http://localhost:3000/api/password/reset', {
                user_email: email,
                new_password: password
            });
            toast.success('Password updated successfully!');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
                    <p className="text-gray-400 text-center text-sm mb-8">Enter a new password for {email}</p>

                    {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}

                    <form onSubmit={handleReset} className="flex flex-col gap-5">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type={showPasswords.password ? "text" : "password"}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                placeholder="New password"
                                className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400 cursor-pointer"
                                onClick={() => setShowPasswords({ ...showPasswords, password: !showPasswords.password })}>
                                {showPasswords.password ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                placeholder="Confirm new password"
                                className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400 cursor-pointer"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                        <button type="submit" className="bg-yellow-700 hover:bg-yellow-600 p-3 rounded-lg text-white font-medium transition cursor-pointer text-sm">
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
