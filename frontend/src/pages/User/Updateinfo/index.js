import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, endpoints } from '../../../API';
import { notifyError, notifySuccess } from '../../../components/ToastManager';
import { FaCamera } from 'react-icons/fa';

const UpdateInfo = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        gender: '',
        avatar: '',
        address: '',
        follower_count: 0,
        following_count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await authApi().get(endpoints.currentuser);
                setUser({ ...res.data });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

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
        formData.append('first_name', user.first_name);
        formData.append('last_name', user.last_name);
        formData.append('phone', user.phone);
        formData.append('email', user.email);
        formData.append('gender', user.gender);
        formData.append('address', user.address);

        if (user.avatar instanceof File) {
            formData.append('avatar', user.avatar);
        }

        try {
            const res = await authApi().patch(endpoints.currentuser, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUser({ ...user, ...res.data });
            notifySuccess('Cập nhật thông tin thành công!');
            window.location.reload();
        } catch (error) {
            notifyError('Cập nhật thất bại.');
            console.error(error);
        }
    };

    const handleChangePassword = () => {
        navigate('/changepassword');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white text-center">
                        Quản lý tài khoản
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Avatar Section */}
                        <div className="flex justify-center">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-amber-500 ring-offset-4">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Avatar Preview" className="h-full w-full object-cover" />
                                    ) : user.avatar && !(user.avatar instanceof File) ? (
                                        <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400 text-lg">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-amber-500 p-3 rounded-full cursor-pointer hover:bg-amber-600 transition-colors shadow-lg group-hover:scale-110">
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

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Họ</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={user.first_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tên</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={user.last_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={user.phone}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Giới tính</label>
                                <select
                                    name="gender"
                                    value={user.gender || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                                >
                                    <option value="" disabled>Chọn giới tính</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={user.address || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>

                        {/* Social Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-gray-700 block mb-1">Người theo dõi</label>
                                <div className="text-2xl font-semibold text-amber-600">{user.follower_count}</div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-gray-700 block mb-1">Đang theo dõi</label>
                                <div className="text-2xl font-semibold text-amber-600">{user.following_count}</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-6">
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Đổi mật khẩu
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UpdateInfo;
