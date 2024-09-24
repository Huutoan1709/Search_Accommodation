import React, { useState, useEffect } from 'react';
import { authApi, endpoints } from '../../../API';

const UpdateInfo = () => {
    const [user, setUser] = useState({
        memberId: '',
        phone: '',
        displayName: '',
        email: '',
        zalo: '',
        facebook: '',
        password: '',
        avatar: '',
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await authApi().get(endpoints.currentUser);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await authApi().patch(endpoints.currentuser, user);
            setMessage('Information updated successfully!');
        } catch (error) {
            setMessage('Failed to update information.');
            console.error(error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6 bg-white border-b border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">
                            Mã thành viên
                        </label>
                        <input
                            type="text"
                            name="memberId"
                            id="memberId"
                            value={user.memberId}
                            onChange={handleInputChange}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Số điện thoại
                        </label>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={user.phone}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                            Tên hiển thị
                        </label>
                        <input
                            type="text"
                            name="displayName"
                            id="displayName"
                            value={user.displayName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div className="col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={user.email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="zalo" className="block text-sm font-medium text-gray-700">
                            Số Zalo
                        </label>
                        <input
                            type="text"
                            name="zalo"
                            id="zalo"
                            value={user.zalo}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                            Facebook
                        </label>
                        <input
                            type="text"
                            name="facebook"
                            id="facebook"
                            value={user.facebook}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                        Ảnh đại diện
                    </label>
                    <input
                        type="file"
                        name="avatar"
                        id="avatar"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <button
                    type="submit"
                    className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Lưu & Cập nhật
                </button>
            </form>
            {message && <div className="mt-3 text-sm font-medium text-green-600">{message}</div>}
        </div>
    );
};

export default UpdateInfo;
