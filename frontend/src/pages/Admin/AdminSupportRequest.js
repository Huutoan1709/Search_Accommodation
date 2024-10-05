import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../API';
import PaginationUser from '../../components/PaginationUser';
import { MdDelete } from 'react-icons/md';
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
        <div className="px-4 py-6 relative">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Quản lý yêu cầu hỗ trợ</h1>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm yêu cầu hỗ trợ"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border p-2 rounded"
                    />
                </div>
            </div>

            <table className="w-full text-lg text-left text-gray-600 border border-gray-200 mt-6">
                <thead className="bg-[#fff] text-gray-600 uppercase text-[14px] font-medium">
                    <tr>
                        <th className="p-4 border">Mã</th>
                        <th className="p-4 border">Người dùng</th>
                        <th className="p-4 border">Số điện thoại</th>
                        <th className="p-4 border">Email</th>
                        <th className="p-4 border">Chủ đề</th>
                        <th className="p-4 border">Trạng thái</th>
                        <th className="p-4 border">Ngày tạo</th>
                        <th className="p-4 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((request, index) => (
                            <tr
                                key={request.id}
                                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} text-center text-[14px]`}
                            >
                                <td className="p-4 border text-xl">#{request?.id}</td>
                                <td className="p-4 border text-xl">
                                    <div className="flex items-center justify-center space-x-2">
                                        <img
                                            src={request?.user?.avatar}
                                            alt={request.user.username}
                                            className="w-20 h-20 rounded-full"
                                        />
                                        <span>{request.user.username}</span>
                                    </div>
                                </td>
                                <td className="p-4 border text-green-400 font-semibold text-xl">
                                    {request.user.phone || 'Không có'}
                                </td>
                                <td className="p-4 border text-xl">{request?.user?.email}</td>
                                <td className="p-4 border text-xl">{request?.subject}</td>
                                <td className="p-4 border text-xl">
                                    {request.is_handle ? (
                                        <span className="text-green-500  text-xl font-semibold border border-green-500 rounded-md p-3">
                                            Đã xử lý
                                        </span>
                                    ) : (
                                        <span className="text-red-500 font-semibold border border-red-500 rounded-md p-3">
                                            Chờ xử lý
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 border text-xl">
                                    {new Date(request.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 border text-xl">
                                    <button
                                        onClick={() => handleApproval(request.id)}
                                        className="text-green-500 hover:text-green-700"
                                    >
                                        <BiEdit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(request.id)}
                                        className="text-red-500 hover:text-red-700 transition ml-4"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="p-4 text-center text-gray-500">
                                Không tìm thấy yêu cầu hỗ trợ nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <PaginationUser currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};

export default AdminSupportRequest;
