import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { authApi, endpoints } from '../../API';
import { notifyError, notifySuccess } from '../../components/ToastManager';
import * as yup from 'yup';

const CreateUserModal = ({ isOpen, onClose }) => {
    const [user, setUser] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        avatar: '',
        reputation: false,
        is_active: true,
        gender: '',
        role: '',
        address: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState('');

    const schema = yup.object().shape({
        email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
        phone: yup
            .string()
            .matches(/^[0-9]+$/, 'Số điện thoại phải là số từ 0-9')
            .required('Số điện thoại là bắt buộc'),
        password: yup
            .string()
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                'Mật khẩu tối thiểu phải chứa 8 ký tự, có ít nhất 1 ký tự thường, hoa và số',
            )
            .required('Mật khẩu là bắt buộc'),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password'), null], 'Mật khẩu không khớp')
            .required('Xác nhận mật khẩu là bắt buộc'),
    });

    const handleInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUser({ ...user, avatar: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await schema.validate({
                email: user.email,
                phone: user.phone,
                password: user.password,
                confirmPassword: user.confirmPassword,
            });
        } catch (error) {
            setError(error.message);
            return;
        }

        const formData = new FormData();
        formData.append('first_name', user.first_name);
        formData.append('last_name', user.last_name);
        formData.append('phone', user.phone);
        formData.append('email', user.email);
        formData.append('gender', user.gender);
        formData.append('role', user.role);
        formData.append('address', user.address);
        formData.append('username', user.username);
        formData.append('password', user.password);
        formData.append('avatar', user.avatar);

        try {
            await authApi().post(endpoints.register, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            notifySuccess('Tạo người dùng thành công!');
            onClose();
        } catch (error) {
            notifyError('Tạo người dùng thất bại.');
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b px-8 py-6">
                    <h2 className="text-2xl font-bold text-gray-800">Thêm người dùng mới</h2>
                    <p className="text-gray-600 mt-1">Điền thông tin để tạo tài khoản mới</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Avatar Upload Section */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
                                {previewImage ? (
                                    <img src={previewImage} alt="Avatar Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                <FaCamera className="text-white text-lg" />
                                <input
                                    type="file"
                                    name="avatar"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="first_name"
                                value={user.first_name}
                                onChange={handleInputChange}
                                placeholder="Họ"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                            <input
                                type="text"
                                name="last_name"
                                value={user.last_name}
                                onChange={handleInputChange}
                                placeholder="Tên"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                value={user.phone}
                                onChange={handleInputChange}
                                placeholder="Số điện thoại"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="username"
                                value={user.username}
                                onChange={handleInputChange}
                                placeholder="Tên đăng nhập"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                value={user.password}
                                onChange={handleInputChange}
                                placeholder="Mật khẩu"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={user.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Xác nhận mật khẩu"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                            <select
                                name="role"
                                value={user.role}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                required
                            >
                                <option value="">Chọn vai trò</option>
                                <option value="WEBMASTER">Quản trị viên</option>
                                <option value="CUSTOMER">Tìm trọ</option>
                                <option value="LANDLORD">Cho thuê</option>
                            </select>
                        </div>

                        {/* Additional Information - Full Width */}
                        <div className="col-span-full">
                            <select
                                name="gender"
                                value={user.gender}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                required
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>

                        <div className="col-span-full">
                            <input
                                type="text"
                                name="address"
                                value={user.address}
                                onChange={handleInputChange}
                                placeholder="Địa chỉ"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            Tạo người dùng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
