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
            const response = await API.post(endpoints.resetpasswordphone, formData);
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
            <div className="flex justify-center items-center bg-gray-100 min-h-screen py-12">
                <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Đặt Lại Mật Khẩu Qua SMS
                    </h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập mật khẩu mới"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Gửi lại OTP
                                    </button>
                                )}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <a href="/login" className="text-blue-600 hover:text-blue-800">
                            Quay lại đăng nhập
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PhoneOTPReset;