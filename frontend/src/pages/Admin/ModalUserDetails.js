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
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b px-8 py-6">
                    <h2 className="text-2xl font-bold text-gray-800">Thông tin người dùng</h2>
                    <p className="text-gray-600 mt-1">Chỉnh sửa thông tin cá nhân của người dùng</p>
                </div>

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
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={user?.first_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={user?.last_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user?.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={user?.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                            <select
                                name="gender"
                                value={user?.gender}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                            <input
                                type="text"
                                value={user?.role === 'WEBMASTER' ? 'Quản trị viên' : 
                                       user?.role === 'CUSTOMER' ? 'Tìm trọ' : 
                                       user?.role === 'LANDLORD' ? 'Cho thuê' : ''}
                                disabled
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={user?.address}
                                onChange={handleInputChange}
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
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserDetailModal;
