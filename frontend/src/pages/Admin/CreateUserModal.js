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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl h-auto">
                <h2 className="text-3xl font-semibold mb-4 text-center">Thêm người dùng mới</h2>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center relative">
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                            {previewImage ? (
                                <img src={previewImage} alt="Avatar Preview" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-gray-400">No Image</span>
                            )}
                            <label className="absolute bottom-0 right-12 mr-2 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-800">
                                <FaCamera className="text-white text-xl" />
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-lg font-medium text-gray-700">Họ</label>
                            <input
                                type="text"
                                name="first_name"
                                value={user.first_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Tên</label>
                            <input
                                type="text"
                                name="last_name"
                                value={user.last_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                value={user.username}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                value={user.password}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={user.confirmPassword}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={user.phone}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Giới tính</label>
                            <select
                                name="gender"
                                value={user.gender}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Vai trò</label>
                            <select
                                name="role"
                                value={user.role}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value="">Chọn vai trò</option>
                                <option value="WEBMASTER">Quản trị viên</option>
                                <option value="CUSTOMER">Tìm trọ</option>
                                <option value="LANDLORD">Cho thuê</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-lg font-medium text-gray-700">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={user.address}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Tạo người dùng
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
