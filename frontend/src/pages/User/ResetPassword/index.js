import React, { useState, useEffect } from 'react';
import API, { endpoints } from '../../../API';
import { useNavigate } from 'react-router-dom';
import { notifyError, notifySuccess } from '../../../components/ToastManager';
import Footer from '../../DefaultLayout/footer';
import Header from '../../DefaultLayout/Header';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [timer]);

    const handleResetPassword = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        if (isOtpSent) {
            formData.append('email', email);
            formData.append('otp', otp);
            formData.append('new_password', newPassword);

            try {
                const response = await API.post(endpoints.resetpassword, formData);
                if (response.status === 200) {
                    notifySuccess('Mật khẩu đã được đặt lại thành công.');
                    setTimeout(() => navigate('/login'), 3000);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.error || 'Có lỗi xảy ra khi đặt lại mật khẩu.';
                setError(errorMsg);
            }
        } else {
            formData.append('email', email);

            try {
                const response = await API.post(endpoints.resetpassword, formData);
                if (response.status === 200) {
                    notifySuccess('OTP đã được gửi đến email của bạn.');
                    setIsOtpSent(true);
                    setTimer(60);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.error || 'Email không đúng hoặc không tồn tại.';
                notifyError(errorMsg);
            }
        }
    };

    const handleResendOTP = async () => {
        try {
            const formData = new FormData();
            formData.append('email', email);
            const response = await API.post(endpoints.resetpassword, formData);
            if (response.status === 200) {
                notifySuccess('Một OTP mới đã được gửi đến email của bạn.');
                setTimer(60);
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi gửi lại OTP.');
        }
    };

    return (
        <>
            <Header />
            <div className="flex justify-center items-center bg-gray-100">
                <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg mt-10">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Đặt Lại Mật Khẩu</h2>
                    {message && <p className="text-lg text-green-500 mb-4">{message}</p>}
                    {error && <p className="text-lg text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isOtpSent}
                            />
                        </div>
                        {isOtpSent && (
                            <>
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">OTP:</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">
                                        Mật khẩu mới:
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </>
                        )}
                        <button
                            type="submit"
                            className="w-full py-3 text-lg font-semibold text-white bg-red-500 rounded-md shadow hover:bg-red-600 focus:outline-none"
                        >
                            {isOtpSent ? 'Đặt lại mật khẩu' : 'Gửi OTP'}
                        </button>
                    </form>
                    <div className="mt-4 text-center">

                    <p className="mt-6 text-lg text-center">
                        Đặt lại mật khẩu bằng?{' '}
                        <a href="/phone-reset-password" className="text-red-600 hover:text-yellow-500">
                            SMS
                        </a>
                    </p>
                    </div>
                    <p className="mt-6 text-lg text-center">
                        Bạn đã có tài khoản?{' '}
                        <a href="/login" className="text-red-600 hover:text-yellow-500">
                            Đăng nhập
                        </a>
                    </p>
                    {isOtpSent && (
                        <p className="mt-4 text-lg text-center">
                            Gửi lại OTP sau: {timer}s{' '}
                            <button onClick={handleResendOTP} className="text-red-600 hover:text-yellow-500">
                                Gửi lại
                            </button>
                        </p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ResetPassword;
