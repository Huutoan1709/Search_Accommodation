import React, { useContext, useState } from 'react';
import { authApi } from '../../../API';
import { notifyWarning, notifySuccess } from '../../../components/ToastManager';
import { useNavigate } from 'react-router-dom';
import MyContext from '../../../context/MyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Header from '../../DefaultLayout/Header';
import Footer from '../../DefaultLayout/footer';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { user, logout, fetchUser } = useContext(MyContext);
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            notifyWarning('Mật khẩu mới và mật khẩu xác nhận không khớp.');
            return;
        }

        if (!validatePassword(formData.newPassword)) {
            notifyWarning('Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, và một số.');
            return;
        }

        try {
            const response = await authApi().post('/user/change-password/', {
                old_password: formData.oldPassword,
                new_password: formData.newPassword,
            });

            if (response.status === 200) {
                notifySuccess('Đổi mật khẩu thành công!');
                logout();
                navigate('/login');
            } else {
                notifyWarning(response.data.error || 'Đổi mật khẩu thất bại.');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            notifyWarning('Có lỗi xảy ra khi cập nhật mật khẩu.');
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'old') setShowOldPassword(!showOldPassword);
        if (field === 'new') setShowNewPassword(!showNewPassword);
        if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div>
            <Header />
            <div className="flex justify-center items-center bg-gray-100">
                <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg mt-10">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Đổi Mật Khẩu</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Mật khẩu cũ:</label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? 'text' : 'password'}
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={() => togglePasswordVisibility('old')}
                                >
                                    <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Mật khẩu mới:</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={() => togglePasswordVisibility('new')}
                                >
                                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">
                                Nhập lại mật khẩu mới:
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 text-2xl font-semibold text-white bg-red-500 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            Cập nhật
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ChangePassword;
