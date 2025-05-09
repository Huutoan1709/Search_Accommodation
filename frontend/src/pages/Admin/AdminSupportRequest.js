import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../API';
import PaginationUser from '../../components/PaginationUser';
import { MdDelete, MdSearch } from 'react-icons/md';
import { notifySuccess } from '../../components/ToastManager';
import { BiEdit } from 'react-icons/bi';

const AdminSupportRequest = () => {
    const [supportRequests, setSupportRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSupportRequests = async (page = 1) => {
        try {
            const response = await authApi().get(endpoints.supportrequest, {
                params: { page, size: pageSize },
            });
            setSupportRequests(response.data.results || []);
            setTotalPages(Math.ceil(response.data.count / pageSize));
        } catch (error) {
            console.error('Failed to fetch support requests:', error);
            setSupportRequests([]);
        }
    };

    useEffect(() => {
        fetchSupportRequests(currentPage);
    }, [currentPage]);

    const handleDelete = async (requestId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ này không?');
        if (confirmDelete) {
            try {
                await authApi().delete(endpoints.deleteSupportRequest(requestId));
                notifySuccess('Xóa yêu cầu hỗ trợ thành công');
                fetchSupportRequests(currentPage);
            } catch (error) {
                console.error('Failed to delete support request:', error);
            }
        }
    };

    const handleApproval = async (requestId) => {
        const confirmAccept = window.confirm('Bạn có chắc chắn đã liên hệ với khách hàng?');
        if (confirmAccept) {
            try {
                await authApi().patch(`${endpoints.supportrequest}${requestId}/`, { is_handle: true });
                notifySuccess('Yêu cầu đã được duyệt thành công');
                fetchSupportRequests(currentPage);
            } catch (error) {
                console.error('Failed to approve support request:', error);
            }
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredRequests = supportRequests.filter((request) => {
        const matchSearch =
            request.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.id?.toString().includes(searchTerm);
        return matchSearch;
    });

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý yêu cầu hỗ trợ</h1>
                <p className="text-gray-600 mt-2">Xem và xử lý các yêu cầu hỗ trợ từ người dùng</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã, email hoặc chủ đề..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Support Requests Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Mã</th>
                            <th className="px-6 py-4 font-medium">Người dùng</th>
                            <th className="px-6 py-4 font-medium">Số điện thoại</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Chủ đề</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 font-medium">Ngày tạo</th>
                            <th className="px-6 py-4 font-medium">Tùy chọn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">#{request?.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={request?.user?.avatar}
                                                alt={request.user.username}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <span className="font-medium">{request.user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-green-600 font-medium">
                                        {request.user.phone || 'Không có'}
                                    </td>
                                    <td className="px-6 py-4">{request?.user?.email}</td>
                                    <td className="px-6 py-4">{request?.subject}</td>
                                    <td className="px-6 py-4">
                                        {request.is_handle ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                Đã xử lý
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                Chờ xử lý
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(request.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleApproval(request.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Đánh dấu đã xử lý"
                                            >
                                                <BiEdit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(request.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Xóa yêu cầu"
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
                                    Không tìm thấy yêu cầu hỗ trợ nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
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

export default AdminSupportRequest;
