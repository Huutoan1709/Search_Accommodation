import React, { useContext, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { notifyWarning, notifySuccess } from '../../../components/ToastManager';
import { useNavigate } from 'react-router-dom';
import MyContext from '../../../context/MyContext';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const { logout } = useContext(MyContext);
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

    return (
        <div className="flex flex-col max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-medium">Đổi Mật Khẩu</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-xl font-semibold mb-2">Mật khẩu cũ</label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Nhập mật khẩu cũ"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-xl font-semibold mb-2">Mật khẩu mới</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Nhập mật khẩu mới"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-xl font-semibold mb-2">Nhập lại mật khẩu mới</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Xác nhận mật khẩu mới"
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cập nhật
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
