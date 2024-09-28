import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { authApi, endpoints } from '../../../API';
import { notifyError, notifySuccess } from '../../../components/ToastManager';
import { FaCamera } from 'react-icons/fa'; // Import camera icon

const UpdateInfo = () => {
    const navigate = useNavigate(); // Initialize navigate
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
    const [previewImage, setPreviewImage] = useState(null); // State for previewing the new image

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
            setPreviewImage(URL.createObjectURL(file)); // Set preview image
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

        // Only append the avatar if a new file is selected
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
        navigate('/changepassword/'); // Navigate to /changepassword
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Quản lý tài khoản</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex justify-center relative">
                    <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                        {previewImage ? ( // If a new image is selected, show it
                            <img src={previewImage} alt="Avatar Preview" className="h-full w-full object-cover" />
                        ) : user.avatar && !(user.avatar instanceof File) ? ( // If no new image but avatar exists, show the existing one
                            <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-gray-400">No Image</span>
                        )}

                        {/* Icon for choosing file */}
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

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ</label>
                        <input
                            type="text"
                            name="first_name"
                            value={user.first_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên</label>
                        <input
                            type="text"
                            name="last_name"
                            value={user.last_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <input
                            type="text"
                            name="phone"
                            value={user.phone}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleInputChange}
                            disabled
                            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm p-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                        <select
                            name="gender"
                            value={user.gender || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                        >
                            <option value="" disabled>
                                Chọn giới tính
                            </option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            value={user.address || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                        />
                    </div>
                </div>

                {/* Followers Section */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Người theo dõi</label>
                        <input
                            type="text"
                            value={user.follower_count}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Đang theo dõi</label>
                        <input
                            type="text"
                            value={user.following_count}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
                        />
                    </div>
                </div>

                {/* Change Password and Submit Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={handleChangePassword}
                        className="py-2 px-6 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Đổi mật khẩu
                    </button>

                    <button
                        type="submit"
                        className="py-2 px-6 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateInfo;
