import React, { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../API';
import { MdDelete } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { notifySuccess } from '../../components/ToastManager';
import PaginationUser from '../../components/PaginationUser';
import { BiEdit } from 'react-icons/bi';
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
        <div className="px-4 py-6 relative">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Quản lý loại phòng</h1>
                <div className="flex space-x-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <BiSearch size={20} />
                        </span>
                        <input
                            type="text"
                            className="pl-10 border border-gray-300 p-2 rounded-md outline-none w-full"
                            placeholder="Tìm kiếm theo tên loại phòng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <table className="w-full text-xl text-left text-gray-600 border border-gray-200 mt-6">
                <thead className="bg-[#fff] text-gray-600 uppercase text-[13px] font-base">
                    <tr>
                        <th className="p-3 border">Mã loại phòng</th>
                        <th className="p-3 border">Tên loại phòng</th>
                        <th className="p-3 border">Trạng thái</th>
                        <th className="p-3 border">Ngày tạo</th>
                        <th className="p-3 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRoomTypes.length > 0 ? (
                        currentRoomTypes.map((roomType) => (
                            <tr key={roomType.id} className="text-center bg-gray-50">
                                <td className="p-3 border text-xl">#{roomType.id}</td>
                                <td className="p-3 border text-xl">{roomType.name}</td>
                                <td className="p-3 border text-xl">
                                    <span className={roomType.is_active ? 'text-green-500' : 'text-red-500'}>
                                        {roomType.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                                    </span>
                                </td>
                                <td className="p-3 border text-xl">
                                    {new Date(roomType.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-3 border relative flex justify-center space-x-2 gap-4">
                                    <button
                                        onClick={() => {
                                            console.log('Chỉnh sửa loại phòng với ID:', roomType.id);
                                        }}
                                        className="text-green-500 hover:text-green-700 focus:outline-none"
                                    >
                                        <BiEdit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(roomType.id)}
                                        className="text-red-500 hover:text-red-700 focus:outline-none"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-4 text-center">
                                Chưa có loại phòng nào...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Component */}
            <PaginationUser currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
};

export default AdminRoomType;
