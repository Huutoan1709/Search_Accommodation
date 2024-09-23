import React, { useState } from 'react';
import API, { endpoints } from '../../../API';
import { useNavigate } from 'react-router-dom';

import { notifyError, notifySuccess } from '../../../components/ToastManager';
const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false); // Trạng thái OTP đã được gửi hay chưa
    const navigate = useNavigate();

    const handleResetPassword = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        if (isOtpSent) {
            // Đã nhập OTP, tiếp tục reset mật khẩu
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
                setError('Có lỗi xảy ra khi đặt lại mật khẩu.');
            }
        } else {
            // Chưa nhập OTP, gửi yêu cầu gửi OTP
            formData.append('email', email);

            try {
                const response = await API.post(endpoints.resetpassword, formData);
                if (response.status === 200) {
                    notifySuccess('OTP đã được gửi đến email của bạn.');
                    setIsOtpSent(true); // Cập nhật trạng thái OTP đã được gửi
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi gửi OTP.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100 h-screen">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-center text-gray-900">Đặt Lại Mật Khẩu</h2>
                {message && <p className="text-sm text-green-500">{message}</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isOtpSent}
                        />
                    </div>
                    {isOtpSent && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">OTP:</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới:</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </>
                    )}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md shadow hover focus"
                    >
                        {isOtpSent ? 'Đặt lại mật khẩu' : 'Gửi OTP'}
                    </button>
                </form>
                <p className="mt-4 text-sm text-center">
                    Bạn đã có tài khoản?{' '}
                    <a href="/login" className="text-yellow-600 hover:text-yellow-500">
                        Đăng nhập
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
