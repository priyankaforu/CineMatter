import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email');
            return;
        }
        setLoading(true);
        try {

            const res = await axios.post('${API_URL}/api/password/forgot', { user_email: email });
            if (res.data) {
                toast.success('OTP sent to your email!');
                setOtpSent(true);
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }
        console.log(otp);
        try {
            const res = await axios.post(`${API_URL}/api/password/verifyOTP`, { client_otp: otp, user_email: email });
            if (res.data) {
                toast.success('OTP verified!');
                navigate('/reset-password', { state: { email } })
            }
            // navigate to reset password page

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
                    <p className="text-gray-400 text-center text-sm mb-8">
                        {otpSent ? 'Enter the OTP sent to your email' : 'Enter your registered email to receive an OTP'}
                    </p>

                    {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}

                    {!otpSent ? (
                        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Registered email"
                                    className="w-full p-3 pl-10 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm"
                                />
                            </div>
                            <button type="submit" disabled={loading}
                                className={`p-3 rounded-lg text-white font-medium transition text-sm ${loading ? 'bg-yellow-900 cursor-not-allowed' : 'bg-yellow-700 hover:bg-yellow-600 cursor-pointer'}`}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                <span>{email}</span>
                                <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                                    className="text-yellow-500 hover:text-yellow-400 text-sm underline cursor-pointer">Change</button>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    className="w-full p-3 rounded-lg bg-white/5 border border-gray-600 text-white focus:border-yellow-500 focus:outline-none caret-white text-sm text-center tracking-widest text-lg"
                                />
                            </div>
                            <button type="submit" className="bg-yellow-700 hover:bg-yellow-600 p-3 rounded-lg text-white font-medium transition cursor-pointer text-sm">
                                Verify OTP
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
                            <ArrowLeft size={16} />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
