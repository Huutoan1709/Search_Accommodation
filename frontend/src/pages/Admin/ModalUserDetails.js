import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import { authApi, endpoints } from '../../API';
import { notifyError, notifySuccess } from '../../components/ToastManager';

const UserDetailModal = ({ isOpen, onClose, userId }) => {
    const [user, setUser] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        avatar: '',
        reputation: false,
        is_active: false,
        gender: '',
        role: '',
        address: '',
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchUserData = async () => {
                try {
                    const res = await authApi().get(endpoints.detailuseradmin(userId));
                    setUser({ ...res.data });
                    setPreviewImage(res.data.avatar);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [isOpen, userId]);

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
        const formData = new FormData();
        formData.append('first_name', user?.first_name);
        formData.append('last_name', user?.last_name);
        formData.append('phone', user?.phone);
        formData.append('gender', user?.gender);
        formData.append('role', user?.role);
        formData.append('address', user?.address);
        formData.append('avatar', user?.avatar);

        try {
            await authApi().patch(endpoints.updateUser(userId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            notifySuccess('Cập nhật thông tin thành công!');
            onClose();
        } catch (error) {
            notifyError('Cập nhật thất bại.');
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl h-auto">
                {' '}
                {/* Adjusted width and height */}
                <h2 className="text-3xl font-semibold mb-4 text-center">Thông tin người dùng</h2>
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
                                value={user?.first_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Tên</label>
                            <input
                                type="text"
                                name="last_name"
                                value={user?.last_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={user?.phone}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user?.email}
                                disabled
                                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-700">Giới tính</label>
                            <select
                                name="gender"
                                value={user?.gender}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                                value={user?.role}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                                value={user?.address}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Đóng
                        </button>

                        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserDetailModal;
