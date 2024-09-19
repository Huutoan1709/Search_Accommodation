import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API'; // Adjust the path as needed
import { memo } from 'react';

const CreatePost = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [image, setImage] = useState(null);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch user's rooms and current user on component mount
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await authApi().get(endpoints.myrooms);
                setRooms(response.data);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
            }
        };

        const fetchCurrentUser = async () => {
            try {
                const response = await authApi().get(endpoints.currentuser);
                setCurrentUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user details:', error);
            }
        };

        fetchRooms();
        fetchCurrentUser();
    }, []);

    // Fetch room details when a room is selected
    const handleRoomSelect = async (roomId) => {
        try {
            const response = await authApi().get(endpoints.roomdetail(roomId));
            setRoomDetails(response.data);
            setSelectedRoom(roomId);
        } catch (error) {
            console.error('Failed to fetch room details:', error);
        }
    };

    // Handle image upload
    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!image || !selectedRoom) {
            alert('Please select a room and an image.');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            await authApi().post(endpoints.postimage(selectedRoom), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Failed to upload image:', error);
        }
    };

    // Handle post creation
    const handlePostCreation = async (e) => {
        e.preventDefault();
        if (!postTitle || !postContent || !selectedRoom) {
            alert('Please fill in all fields and select a room.');
            return;
        }

        setLoading(true);
        try {
            const postData = {
                title: postTitle,
                content: postContent,
                user: currentUser.id,
                room: selectedRoom,
            };

            const response = await authApi().post(endpoints.post, postData);
            alert('Post created successfully!');
            setPostTitle('');
            setPostContent('');
            setSelectedRoom(null);
            setImage(null);
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4">
            <h1 className="text-3xl font-medium py-4 border-b border-gray-200">Đăng Tin Mới</h1>
            <div className="flex justify-center gap-4">
                <div className="py-4 flex flex-col gap-4 flex-auto">
                    <form onSubmit={handlePostCreation}>
                        <div>
                            {/* List of rooms */}
                            <h2 className="text-xl font-semibold mb-2">Chọn phòng cần đăng</h2>
                            <select
                                className="border border-gray-300 p-2 rounded w-full"
                                onChange={(e) => handleRoomSelect(e.target.value)}
                            >
                                <option value="">Chọn phòng</option>
                                {rooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        Căn phòng {room?.ward} - {room?.district} - {room?.city} - {room?.price}{' '}
                                        triệu/tháng
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedRoom && (
                            <>
                                {/* Room Details */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Thông tin chi tiết</h2>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col mb-6">
                                            <span className="text-[14px] font-semibol">Giá (triệu/tháng)</span>
                                            <span className="  border border-gray-500 rounded-sm p-1">
                                                {roomDetails?.price}
                                            </span>
                                        </div>
                                        <div className="flex flex-col mb-6">
                                            <span className="text-[14px] font-semibol">Diện tích</span>
                                            <span>{roomDetails?.area} m²</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col mb-6 ">
                                        <h2 className="text-[14px] font-sem">Loại Phòng</h2>
                                        <span className="rounded-sm items-center border border-gray-500 p-1 h-[30px] w-[300px]">
                                            {roomDetails?.room_type.name}
                                        </span>
                                    </div>

                                    <p>
                                        <strong>Địa chỉ:</strong> {roomDetails.address}
                                    </p>
                                    {/* Add more room details here as needed */}
                                </div>
                                {/* Contact Information (read-only) */}
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">Thông Tin Liên Hệ:</h2>
                                    <p>
                                        <strong>Tên:</strong> {currentUser.first_name} {currentUser.last_name}
                                    </p>
                                    <p>
                                        <strong>Số điện thoại:</strong> {currentUser.phone}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang tạo bài đăng...' : 'Tạo bài đăng'}
                                </button>
                            </>
                        )}
                    </form>
                    {/* Image Upload */}
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Thêm Hình Ảnh</h2>
                        <input
                            type="file"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                        <button onClick={handleImageUpload} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
                            Tải lên
                        </button>
                    </div>
                    {/* Post Title and Content */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Tiêu đề bài đăng</label>
                        <input
                            type="text"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                            placeholder="Phòng trọ giá rẻ tại quận 1 đầy đủ tiện ích giá cả sinh viên ..."
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nội dung bài đăng</label>
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                            placeholder="Phòng trọ mặt tiền đường, gần trường học, siêu thị, thuận tiện đi lại..."
                        />
                    </div>
                </div>
                <div className="w-[30%] flex-none">
                    {/* Google Map Placeholder */}
                    <h2 className="text-xl font-semibold mb-2">Vị Trí Trên Google Map</h2>
                    {/* Add Google Maps integration here */}
                    <div className="bg-gray-200 h-64">Google Map placeholder</div>
                </div>
            </div>
        </div>
    );
};

export default memo(CreatePost);
