import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../API';
import { MdDelete } from 'react-icons/md';
import { FaLock } from 'react-icons/fa';
import { notifySuccess } from '../../components/ToastManager';
import PaginationUser from '../../components/PaginationUser';
import { BiDotsHorizontalRounded, BiLock, BiLockOpen } from 'react-icons/bi';
import { BsEyeFill } from 'react-icons/bs';
import ModalUserDetails from './ModalUserDetails';

const AdminUser = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async (page = 1) => {
        try {
            const response = await authApi().get(endpoints.listuser, {
                params: { page, size: pageSize },
            });
            setUsers(response.data.results || []);
            setTotalPages(Math.ceil(response.data.count / pageSize));
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?');
        if (confirmDelete) {
            try {
                await authApi().delete(endpoints.deleteUser(userId));
                notifySuccess('Xóa người dùng thành công');
                fetchUsers(currentPage);
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };
    const handleLock = async (userId) => {
        const confirmLock = window.confirm('Bạn có chắc chắn muốn khóa người dùng này không?');
        if (confirmLock) {
            try {
                await authApi().patch(endpoints.updateUser(userId), { is_active: false });
                notifySuccess('Khóa người dùng thành công');
                fetchUsers(currentPage);
            } catch (error) {
                console.error('Failed to lock user:', error);
            }
        }
    };
    const handleUnlock = async (userId) => {
        const confirmUnlock = window.confirm('Bạn có chắc chắn muốn mở khóa người dùng này không?');
        if (confirmUnlock) {
            try {
                await authApi().patch(endpoints.updateUser(userId), { is_active: true });
                notifySuccess('Mở khóa người dùng thành công');
                fetchUsers(currentPage);
            } catch (error) {
                console.error('Failed to unlock user:', error);
            }
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const confirmToggle = window.confirm(
            `Bạn có chắc chắn muốn ${currentStatus ? 'ngừng hoạt động' : 'hoạt động'} người dùng này không?`,
        );
        if (confirmToggle) {
            try {
                const newStatus = !currentStatus;
                await authApi().patch(endpoints.toggleUserStatus(userId), { is_active: newStatus });
                notifySuccess(`Người dùng đã được ${newStatus ? 'hoạt động' : 'ngừng hoạt động'}`);
                fetchUsers(currentPage);
            } catch (error) {
                console.error('Failed to toggle user status:', error);
            }
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        setOpenDropdown(null);
    };

    const filteredUsers = users.filter((user) => {
        const matchSearch =
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id?.toString().includes(searchTerm);
        return matchSearch;
    });

    return (
        <div className="px-4 py-6 relative">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Quản lý người dùng</h1>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border p-2 rounded"
                    />
                    <button
                        onClick={() => console.log('Tạo người dùng mới')}
                        className="bg-[#333A48] text-white px-4 py-2 rounded-md"
                    >
                        Thêm người dùng
                    </button>
                </div>
            </div>

            <table className="w-full text-xl text-left text-gray-600 border border-gray-200 mt-6">
                <thead className="bg-[#fff] text-gray-600 uppercase text-[13px] font-base items-center">
                    <tr>
                        <th className="p-3 border">Mã</th>
                        <th className="p-3 border">Ảnh đại diện</th>
                        <th className="p-3 border">Tên người dùng</th>
                        <th className="p-3 border">Email</th>
                        <th className="p-3 border">Trạng thái</th>
                        <th className="p-3 border">Đánh giá</th>
                        <th className="p-3 border">Vai trò</th>
                        <th className="p-3 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <tr
                                key={user.id}
                                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} text-center text-[14px]`}
                            >
                                <td className="p-3 border">#{user?.id}</td>
                                <td className="p-3 border">
                                    <img
                                        src={user.avatar}
                                        alt={user.username}
                                        className="w-20 h-20 object-cover rounded-full mx-auto"
                                    />
                                </td>
                                <td className="p-3 border">{user?.username}</td>
                                <td className="p-3 border">{user?.email}</td>
                                <td className="p-3 border">
                                    <button
                                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                                        className={`px-4 py-2 rounded-md font-semibold ${
                                            user.is_active ? 'text-green-500' : 'text-red-500'
                                        } hover:opacity-80 transition`}
                                    >
                                        {user.is_active ? 'Hoạt động' : 'Bị khóa'}
                                    </button>
                                </td>
                                <td className="p-3 border">
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>{user.average_rating?.toFixed(1)}</span>
                                        <span className="text-yellow-500">★</span>
                                    </div>
                                </td>
                                <td className="p-3 border font-semibold">{user.is_superuser ? 'ADMIN' : user.role}</td>
                                <td className="p-3 border relative">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                        className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
                                    >
                                        <BiDotsHorizontalRounded size={20} />
                                    </button>
                                    {openDropdown === user.id && (
                                        <div className="absolute right-0 z-10 bg-white border border-gray-300 rounded shadow-lg w-[100px]">
                                            <ul className="py-2">
                                                <li
                                                    onClick={() => handleViewDetails(user)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <BsEyeFill size={15} className="inline mr-2" />
                                                    Chi tiết
                                                </li>
                                                <li
                                                    onClick={() => {
                                                        handleDelete(user.id);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <div className="flex items-center ">
                                                        <MdDelete size={15} className="inline mr-2" />
                                                        Xóa
                                                    </div>
                                                </li>
                                                {user.is_active ? (
                                                    <li
                                                        onClick={() => {
                                                            handleLock(user?.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <FaLock size={15} className="mr-2" />
                                                        Khóa
                                                    </li>
                                                ) : (
                                                    <li
                                                        onClick={() => {
                                                            handleUnlock(user?.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <FaLock size={15} className="mr-2" />
                                                        Mở
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="p-3 text-center text-gray-500">
                                Không tìm thấy người dùng nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedUser && (
                <ModalUserDetails userId={selectedUser.id} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            )}

            <PaginationUser currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};

export default AdminUser;
