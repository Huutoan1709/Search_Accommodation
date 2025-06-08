import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { endpoints } from '../../../API';
import { notifyError, notifySuccess, notifyWarning } from '../../../components/ToastManager';
import Header from '../../DefaultLayout/Header';
import Footer from '../../DefaultLayout/footer';

const PhoneOTPReset = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResetPassword = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        if (isOtpSent) {
            formData.append('phone', phone);
            formData.append('otp', otp);
            formData.append('new_password', newPassword);

            try {
                const response = await API.post(endpoints.PhoneOTPReset, formData);
                if (response.status === 200) {
                    notifySuccess('Mật khẩu đã được đặt lại thành công.');
                    setTimeout(() => navigate('/login'), 3000);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.error || 'Có lỗi xảy ra khi đặt lại mật khẩu.';
                setError(errorMsg);
                notifyError(errorMsg);
            }
        } else {
            formData.append('phone', phone);
            try {
                const response = await API.post(endpoints.PhoneOTPReset, formData);
                if (response.status === 200) {
                    notifySuccess('OTP đã được gửi đến số điện thoại của bạn.');
                    setIsOtpSent(true);
                    setTimer(60);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.error || 'Số điện thoại không đúng hoặc không tồn tại.';
                notifyError(errorMsg);
            }
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0) {
            notifyWarning(`Vui lòng đợi ${timer} giây trước khi gửi lại OTP`);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('phone', phone);
            const response = await API.post(endpoints.PhoneOTPReset, formData);
            if (response.status === 200) {
                notifySuccess('Một OTP mới đã được gửi đến số điện thoại của bạn.');
                setTimer(60);
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi gửi lại OTP.');
            notifyError('Có lỗi xảy ra khi gửi lại OTP.');
        }
    };

    return (
        <>
            <Header />
            <div className="flex justify-center items-center bg-gray-100">
                <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg mt-10">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Đặt Lại Mật Khẩu Qua SMS
                    </h2>
                    {error && <p className="text-lg text-red-500 mb-4">{error}</p>}
                    
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Số điện thoại:
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isOtpSent}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        {isOtpSent && (
                            <>
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">
                                        Mã OTP:
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Nhập mã OTP"
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
                                        placeholder="Nhập mật khẩu mới"
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

                    {isOtpSent && (
                        <div className="mt-4 text-center">
                            <p className="text-gray-600">
                                {timer > 0 ? (
                                    `Gửi lại OTP sau ${timer}s`
                                ) : (
                                    <button
                                        onClick={handleResendOTP}
                                        className="text-red-600 hover:text-yellow-500"
                                    >
                                        Gửi lại OTP
                                    </button>
                                )}
                            </p>
                        </div>
                    )}

                    <p className="mt-6 text-lg text-center">
                        Đặt lại mật khẩu bằng?{' '}
                        <a href="/reset-password" className="text-red-600 hover:text-yellow-500">
                            Email
                        </a>
                    </p>

                    <p className="mt-6 text-lg text-center">
                        Bạn đã có tài khoản?{' '}
                        <a href="/login" className="text-red-600 hover:text-yellow-500">
                            Đăng nhập
                        </a>
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PhoneOTPReset;