import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../API';
import { MdDelete, MdLock } from 'react-icons/md';
import { FaLock } from 'react-icons/fa';
import { notifySuccess } from '../../components/ToastManager';
import PaginationUser from '../../components/PaginationUser';
import { BiDotsHorizontalRounded, BiLock, BiLockOpen } from 'react-icons/bi';
import { BsEyeFill } from 'react-icons/bs';
import ModalUserDetails from './ModalUserDetails';
import CreateUserModal from './CreateUserModal';

const AdminUser = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('all');

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

    const handleLock = async (userId) => {
        const confirmLock = window.confirm('Bạn có chắc chắn muốn khóa người dùng này không? Hành động này không thể hoàn tác.');
        if (confirmLock) {
            try {
                await authApi().patch(endpoints.updateUser(userId), { is_block: true });
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
                await authApi().patch(endpoints.updateUser(userId), { is_block: false });
                notifySuccess('Mở khóa người dùng thành công');
                fetchUsers(currentPage);
            } catch (error) {
                console.error('Failed to unlock user:', error);
            }
        }
    };

    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.');
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

    const handleOpenCreateUserModal = () => {
        setIsCreateUserModalOpen(true);
    };

    const handleCloseCreateUserModal = () => {
        setIsCreateUserModalOpen(false);
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

        const matchRole = 
            selectedRole === 'all' || 
            (selectedRole === 'admin' && user.is_superuser) ||
            (selectedRole === 'landlord' && user.role === 'LANDLORD') ||
            (selectedRole === 'customer' && user.role === 'CUSTOMER');

        return matchSearch && matchRole;
    });

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
                <p className="text-gray-600 mt-2">Quản lý và giám sát tất cả người dùng trong hệ thống</p>
            </div>

            {/* Search and Actions Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 flex gap-4">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email, mã..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="admin">Admin</option>
                            <option value="landlord">Chủ trọ</option>
                            <option value="customer">Người thuê</option>
                        </select>
                    </div>
                    <button
                        onClick={handleOpenCreateUserModal}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Thêm người dùng</span>
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Mã</th>
                            <th className="px-6 py-4 font-medium">Ảnh đại diện</th>
                            <th className="px-6 py-4 font-medium">Tên người dùng</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 font-medium">Đánh giá</th>
                            <th className="px-6 py-4 font-medium">Vai trò</th>
                            <th className="px-6 py-4 font-medium">Tùy chọn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">#{user?.id}</td>
                                    <td className="px-6 py-4">
                                        <img
                                            src={user.avatar}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium">{user?.username}</td>
                                    <td className="px-6 py-4 text-gray-600">{user?.email}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                user.is_block
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {user.is_block ? 'Bị khóa' : 'Hoạt động'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{user.average_rating?.toFixed(1)}</span>
                                            <span className="text-yellow-400">★</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {user.is_superuser ? 'ADMIN' : user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(user)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600"
                                                title="Xem chi tiết"
                                            >
                                                <BsEyeFill size={20} />
                                            </button>
                                            {!user.is_block && (
                                                <button
                                                    onClick={() => handleLock(user?.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-600"
                                                    title="Khóa tài khoản"
                                                >
                                                    <MdLock size={20} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(user?.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-600"
                                                title="Xóa tài khoản"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals and Pagination */}
            <CreateUserModal isOpen={isCreateUserModalOpen} onClose={handleCloseCreateUserModal} />
            {selectedUser && (
                <ModalUserDetails 
                    userId={selectedUser.id} 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
            <div className="mt-6">
                <PaginationUser 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                />
            </div>
        </div>
    );
};

export default AdminUser;
