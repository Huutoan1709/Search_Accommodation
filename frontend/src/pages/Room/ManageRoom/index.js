import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import CreateRoom from '../CreateRoom';
import { GrFormAdd } from 'react-icons/gr';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import * as XLSX from 'xlsx';
import EditRoom from '../EditRoom';
import { AiOutlineFileExcel } from 'react-icons/ai';
import { notifyError, notifySuccess } from '../../../components/ToastManager';
import PaginationUser from '../../../components/PaginationUser';

const ManageRoom = () => {
    const [rooms, setRooms] = useState([]);
    const [initialRooms, setInitialRooms] = useState([]);
    const [priceFilter, setPriceFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const roomsPerPage = 10;

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await authApi().get(endpoints.myrooms);
                setRooms(response.data);
                setInitialRooms(response.data);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
            }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        // Reset other filter when switching filter type
        if (priceFilter && statusFilter) {
            setPriceFilter('');
        }
    }, [statusFilter]);

    useEffect(() => {
        if (priceFilter && statusFilter) {
            setStatusFilter('');
        }
    }, [priceFilter]);

    const handlePriceFilterChange = (event) => {
        const value = event.target.value;
        setPriceFilter(value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (event) => {
        const value = event.target.value;
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleShowCreateRoom = () => {
        setShowCreateRoom(true);
    };

    const handleCloseShowEdit = () => {
        setCurrentRoomId(null);
        setShowEdit(false);
    };
    const handleShowEditRoom = (roomId) => {
        setCurrentRoomId(roomId);
        setShowEdit(true);
    };
    const handleCloseCreateRoom = () => {
        setShowCreateRoom(false);
    };

    const handleDeleteRoom = async (roomId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa phòng này không?');
        if (confirmDelete) {
            try {
                await authApi().delete(endpoints.deleteroom(roomId));
                setRooms(rooms.filter((room) => room.id !== roomId));
                notifySuccess('Xóa phòng thành công');
            } catch (error) {
                console.error('Failed to delete room:', error);

                if (error.response && error.response.data) {
                    notifyError(error.response.data.error);
                } else {
                    notifyError('Xóa phòng thất bại');
                }
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredRooms = () => {
        let sortedRooms = [...rooms];

        if (priceFilter) {
            sortedRooms = sortedRooms.sort((a, b) => (priceFilter === 'asc' ? a.price - b.price : b.price - a.price));
        }

        if (statusFilter) {
            sortedRooms = sortedRooms.sort((a, b) =>
                statusFilter === 'asc'
                    ? new Date(b.created_at) - new Date(a.created_at)
                    : new Date(a.created_at) - new Date(b.created_at),
            );
        }

        return sortedRooms;
    };
    //Phân trang
    const totalRooms = filteredRooms().length;
    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms().slice(indexOfFirstRoom, indexOfLastRoom);

    // xuất file excel
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(rooms);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rooms');
        XLSX.writeFile(workbook, 'rooms_data.xlsx');
    };

    return (
        <div className="px-6 py-8 min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </span>
                        <span>Quản lý phòng</span>
                        <span className="text-xl font-normal text-gray-500">({rooms.length} phòng)</span>
                    </h1>

                    <div className="flex flex-col md:flex-row gap-3">
                        <select
                            className="w-full md:w-48 py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            onChange={handlePriceFilterChange}
                            value={priceFilter}
                        >
                            <option value="">Lọc theo giá</option>
                            <option value="asc">Giá tăng dần</option>
                            <option value="desc">Giá giảm dần</option>
                        </select>

                        <select
                            className="w-full md:w-48 py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            onChange={handleStatusFilterChange}
                            value={statusFilter}
                        >
                            <option value="">Lọc theo ngày</option>
                            <option value="asc">Mới nhất</option>
                            <option value="desc">Cũ nhất</option>
                        </select>

                        <button
                            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            onClick={exportToExcel}
                        >
                            <AiOutlineFileExcel size={20} />
                            <span>Xuất Excel</span>
                        </button>

                        <button
                            className="flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                            onClick={handleShowCreateRoom}
                        >
                            <GrFormAdd size={20} className="filter invert" />
                            <span>Thêm phòng</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Mã Phòng</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Loại Phòng</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Giá/tháng</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Diện tích</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Địa chỉ</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Ngày đăng</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Tùy chọn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentRooms.length > 0 ? (
                                currentRooms.map((room) => (
                                    <tr key={room.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 text-xl text-gray-600">
                                            #{room?.id}
                                        </td>
                                        <td className="px-6 py-4 text-xl text-gray-900">
                                            {room?.room_type?.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xl font-medium text-green-600">
                                                {room?.price} triệu
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xl text-gray-900">
                                            {room?.area} m²
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-xl text-gray-600 truncate hover:text-clip">
                                                {`${room?.other_address}, ${room?.ward}, ${room?.district}, ${room?.city}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xl text-gray-600">
                                            {formatDate(room?.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-4 py-2 rounded-full text-base font-medium ${
                                                room?.has_post ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {room?.has_post ? 'Đã đăng' : 'Chưa đăng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button
                                                onClick={() => handleShowEditRoom(room.id)}
                                                className="text-amber-600 hover:text-amber-900 transition-colors duration-200 p-2 hover:bg-amber-50 rounded-full"
                                                title="Sửa"
                                            >
                                                <RiEditFill size={24} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 hover:bg-red-50 rounded-full"
                                                title="Xóa"
                                            >
                                                <MdDelete size={24} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500 text-xl">
                                        Không tìm thấy phòng nào...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-6">
                <PaginationUser
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalRooms / roomsPerPage)}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Modals */}
            {showCreateRoom && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto relative">
                            <div className="p-6">
                                <CreateRoom onClose={handleCloseCreateRoom} />
                                <button 
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                                    onClick={handleCloseCreateRoom}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showEdit && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto relative">
                            <div className="p-6">
                                <EditRoom roomId={currentRoomId} onClose={handleCloseShowEdit} />
                                <button 
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                                    onClick={handleCloseShowEdit}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageRoom;
