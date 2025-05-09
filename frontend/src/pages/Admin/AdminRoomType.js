import React, { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../API';
import { MdDelete } from 'react-icons/md';
import { BiSearch, BiEdit, BiPlus } from 'react-icons/bi';
import { notifySuccess } from '../../components/ToastManager';
import PaginationUser from '../../components/PaginationUser';

const AdminRoomType = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const roomTypesPerPage = 10;

    const fetchRoomTypes = async () => {
        try {
            const response = await authApi().get(endpoints.roomtype);
            setRoomTypes(response.data || []);
        } catch (error) {
            console.error('Failed to fetch room types:', error);
            setRoomTypes([]);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    const handleDelete = async (roomTypeId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa loại phòng này không?');
        if (confirmDelete) {
            try {
                await authApi().delete(endpoints.deleteroomtype(roomTypeId));
                notifySuccess('Xóa loại phòng thành công');
                fetchRoomTypes();
            } catch (error) {
                console.error('Failed to delete room type:', error);
            }
        }
    };

    const filteredRoomTypes = roomTypes.filter((type) => type.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalRoomTypes = filteredRoomTypes.length;
    const totalPages = Math.ceil(totalRoomTypes / roomTypesPerPage);
    const indexOfLastRoomType = currentPage * roomTypesPerPage;
    const indexOfFirstRoomType = indexOfLastRoomType - roomTypesPerPage;
    const currentRoomTypes = filteredRoomTypes.slice(indexOfFirstRoomType, indexOfLastRoomType);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý loại phòng</h1>
                <p className="text-gray-600 mt-2">Quản lý các loại phòng trong hệ thống</p>
            </div>

            {/* Search and Actions Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <BiSearch size={20} />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Tìm kiếm theo tên loại phòng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <button 
                        className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                        onClick={() => {/* Add new room type logic */}}
                    >
                        <BiPlus size={20} />
                        <span>Thêm loại phòng</span>
                    </button>
                </div>
            </div>

            {/* Room Types Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Mã loại phòng</th>
                            <th className="px-6 py-4">Tên loại phòng</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Ngày tạo</th>
                            <th className="px-6 py-4">Tùy chọn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentRoomTypes.length > 0 ? (
                            currentRoomTypes.map((roomType) => (
                                <tr key={roomType.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">#{roomType.id}</td>
                                    <td className="px-6 py-4 font-medium">{roomType.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center w-fit
                                            ${roomType.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'}`}>
                                            {roomType.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(roomType.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {/* Edit logic */}}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <BiEdit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(roomType.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Xóa"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    Chưa có loại phòng nào...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination at the bottom */}
            <div className="mt-6">
                <PaginationUser 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default AdminRoomType;
