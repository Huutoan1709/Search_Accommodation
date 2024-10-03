import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import CreateRoom from '../CreateRoom';
import Addprices from './Addprices';
import { GrFormAdd } from 'react-icons/gr';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import { IoIosAddCircle } from 'react-icons/io';
import EditRoom from '../EditRoom';
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
                const response = await authApi().get(endpoints.myrooms); // API lấy danh sách phòng
                setRooms(response.data);
                setInitialRooms(response.data); // Lưu trạng thái ban đầu
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
        // Reset other filter when switching filter type
        if (priceFilter && statusFilter) {
            setStatusFilter('');
        }
    }, [priceFilter]);

    const handlePriceFilterChange = (event) => {
        const value = event.target.value;
        setPriceFilter(value);
        setCurrentPage(1); // Reset trang về 1 khi thay đổi bộ lọc
    };

    const handleStatusFilterChange = (event) => {
        const value = event.target.value;
        setStatusFilter(value);
        setCurrentPage(1); // Reset trang về 1 khi thay đổi bộ lọc
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

                // Kiểm tra xem có thông báo lỗi từ server không
                if (error.response && error.response.data) {
                    notifyError(error.response.data.error); // Hiển thị thông báo lỗi từ server
                } else {
                    notifyError('Xóa phòng thất bại'); // Thông báo lỗi mặc định
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

        // Apply filters
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
    const totalRooms = filteredRooms().length;
    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms().slice(indexOfFirstRoom, indexOfLastRoom);
    return (
        <div className="px-4 py-6 relative">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between z-30">
                <h1 className="text-3xl font-medium">Quản lý phòng</h1>
                <div className="gap-3 flex">
                    <select
                        className="outline-none border border-gray-300 p-2 rounded-md"
                        onChange={handlePriceFilterChange}
                        value={priceFilter}
                    >
                        <option value="">Lọc theo giá</option>
                        <option value="asc">Giá tăng dần</option>
                        <option value="desc">Giá giảm dần</option>
                    </select>
                    <select
                        className="outline-none border border-gray-300 p-2 rounded-md"
                        onChange={handleStatusFilterChange}
                        value={statusFilter}
                    >
                        <option value="">Lọc theo ngày</option>
                        <option value="asc">Mới nhất</option>
                        <option value="desc">Cũ nhất</option>
                    </select>
                    <button
                        className="flex items-center bg-red-500 text-white px-4 py-2 rounded"
                        onClick={handleShowCreateRoom}
                    >
                        <GrFormAdd size={20} /> Thêm phòng
                    </button>
                </div>
            </div>
            {successMessage && <div className="bg-green-500 text-white p-4 rounded mb-4">{successMessage}</div>}
            <table className="w-full table-auto border-collapse border border-gray-200 mt-4">
                <thead>
                    <tr className="bg-blue-500 text-white">
                        <th className="p-2 border">Mã Phòng</th>
                        <th className="p-2 border">Loại Phòng</th>
                        <th className="p-2 border">Giá (triệu/tháng)</th>
                        <th className="p-2 border">Diện tích (m²)</th>
                        <th className="p-2 border">Địa chỉ</th>
                        <th className="p-2 border">Ngày đăng</th>
                        <th className="p-2 border">Tình trạng</th>
                        <th className="p-2 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRooms.length > 0 ? (
                        currentRooms.map((room) => (
                            <tr key={room.id} className="text-center odd:bg-gray-100 even:bg-white">
                                <td className="p-3 border">#{room?.id}</td>
                                <td className="p-3 border">{room?.room_type?.name}</td>
                                <td className="p-3 border">{room?.price}</td>
                                <td className="p-3 border">{room?.area}</td>
                                <td className="p-3 border">
                                    {`${room?.other_address}, ${room?.ward}, ${room?.district}, ${room?.city}`.length >
                                    50
                                        ? `${`${room?.other_address}, ${room?.ward}, ${room?.district}, ${room?.city}`.slice(
                                              0,
                                              50,
                                          )}...`
                                        : `${room?.other_address}, ${room?.ward}, ${room?.district}, ${room?.city}`}
                                </td>
                                <td className="p-3 border">{formatDate(room?.created_at)}</td>
                                <td className="p-3 border">
                                    <span
                                        className={
                                            room?.has_post ? 'text-green-500 font-bold' : 'text-red-500 font-bold'
                                        }
                                    >
                                        {room?.has_post ? 'Đã đăng' : 'Chưa đăng'}
                                    </span>
                                </td>
                                <td className="p-3 border">
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                        onClick={() => handleShowEditRoom(room.id)}
                                    >
                                        <RiEditFill size={15} />
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                        onClick={() => handleDeleteRoom(room.id)}
                                    >
                                        <MdDelete size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="p-4 text-center">
                                Chưa có phòng nào...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <PaginationUser
                currentPage={currentPage}
                totalPages={Math.ceil(totalRooms / roomsPerPage)}
                onPageChange={setCurrentPage}
            />
            {showCreateRoom && (
                <>
                    <div className="fixed inset-0 bg-gray-500 opacity-50 z-40"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg relative">
                            <CreateRoom onClose={handleCloseCreateRoom} />
                            <button className="absolute top-2 right-2 text-gray-600" onClick={handleCloseCreateRoom}>
                                X
                            </button>
                        </div>
                    </div>
                </>
            )}
            {showEdit && (
                <>
                    <div className="fixed inset-0 bg-gray-500 opacity-50 z-40"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg relative">
                            <EditRoom roomId={currentRoomId} onClose={handleCloseShowEdit} />
                            <button className="absolute top-2 right-2 text-gray-600" onClick={handleCloseShowEdit}>
                                X
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageRoom;
