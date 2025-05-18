import React, { useState, useEffect } from 'react';
import { authApi, endpoints } from '../../API';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaUserTag } from 'react-icons/fa';

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

    useEffect(() => {
        if (isOpen) {
            const fetchUserData = async () => {
                try {
                    const res = await authApi().get(endpoints.detailuseradmin(userId));
                    setUser({ ...res.data });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    const getRoleName = (role) => {
        switch (role) {
            case 'WEBMASTER': return 'Quản trị viên';
            case 'CUSTOMER': return 'Tìm trọ';
            case 'LANDLORD': return 'Cho thuê';
            default: return '';
        }
    };

    const getGenderName = (gender) => {
        switch (gender) {
            case 'MALE': return 'Nam';
            case 'FEMALE': return 'Nữ';
            case 'OTHER': return 'Khác';
            default: return 'Không xác định';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-white">Thông tin người dùng</h2>
                    <p className="text-blue-100 mt-1">Chi tiết thông tin cá nhân</p>
                </div>

                <div className="p-8">
                    {/* Avatar Section */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                        <FaUser className="text-4xl text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow text-sm font-medium">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {user.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                            </div>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="space-y-6">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <FaUser className="text-blue-500 text-xl mr-4" />
                            <div>
                                <p className="text-sm text-gray-500">Họ và tên</p>
                                <p className="font-medium">{`${user.first_name} ${user.last_name}`}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <FaEnvelope className="text-blue-500 text-xl mr-4" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <FaPhone className="text-blue-500 text-xl mr-4" />
                            <div>
                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                <p className="font-medium">{user.phone || 'Chưa cập nhật'}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <FaVenusMars className="text-blue-500 text-xl mr-4" />
                            <div>
                                <p className="text-sm text-gray-500">Giới tính</p>
                                <p className="font-medium">{getGenderName(user.gender)}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <FaUserTag className="text-blue-500 text-xl mr-4" />
                            <div>
                                <p className="text-sm text-gray-500">Vai trò</p>
                                <p className="font-medium">{getRoleName(user.role)}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <FaMapMarkerAlt className="text-blue-500 text-xl mr-4" />
                            <div>
                                <p className="text-sm text-gray-500">Địa chỉ</p>
                                <p className="font-medium">{user.address || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
