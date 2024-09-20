import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API'; // Adjust the path as needed

const CreatePost = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [images, setImages] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await authApi().get(endpoints.myrooms);
                // Lọc các phòng có has_post = false
                const availableRooms = response.data.filter((room) => !room.has_post);
                setRooms(availableRooms);
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
        if (images.length < 4) {
            // Kiểm tra xem có ít nhất 4 ảnh không
            alert('Bạn cần tải lên ít nhất 4 hình ảnh.');
            return;
        }
        if (!selectedRoom) {
            alert('Please select a room.');
            return;
        }

        const formData = new FormData();
        images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            await authApi().post(endpoints.postimages(selectedRoom), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Images uploaded successfully!');
        } catch (error) {
            console.error('Failed to upload images:', error);
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
            setImages(null);
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-semibold mb-6">Tạo Bài Đăng Mới</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={handlePostCreation} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Chọn Phòng Cần Đăng</label>
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
                            <div className="space-y-4">
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h2 className="text-2xl font-semibold mb-4">Thông Tin Phòng</h2>
                                    <p>
                                        <strong>Giá:</strong> {roomDetails?.price} triệu/tháng
                                    </p>
                                    <p>
                                        <strong>Diện tích:</strong> {roomDetails?.area} m²
                                    </p>
                                    <p>
                                        <strong>Địa chỉ:</strong> {roomDetails?.ward}, {roomDetails?.district},{' '}
                                        {roomDetails?.city}
                                    </p>
                                    <p>
                                        <strong>Số nhà,đường:</strong> {roomDetails?.other_address}
                                    </p>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h2 className="text-2xl font-semibold mb-4">Thông Tin Liên Hệ</h2>
                                    <p>
                                        <strong>Tên:</strong> {roomDetails?.landlord?.first_name}{' '}
                                        {roomDetails?.landlord?.last_name}
                                    </p>
                                    <p>
                                        <strong>Số điện thoại:</strong> {currentUser.phone}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {currentUser.email}
                                    </p>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h2 className="text-2xl font-semibold mb-4">Chi Phí Khác (/Tháng)</h2>
                                    {roomDetails?.prices?.map((price) => (
                                        <p key={price.id}>
                                            <strong>{price.name}:</strong> {price.value} VNĐ
                                        </p>
                                    ))}
                                </div>

                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h2 className="text-2xl font-semibold mb-4">Nội Thất Sẵn có</h2>
                                    {roomDetails?.amenities?.map((amenity) => (
                                        <p key={amenity.id}>
                                            <strong>{amenity.name}</strong>
                                        </p>
                                    ))}
                                </div>

                                <div className="space-y-4">
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
                                            className="border border-gray-300 p-2 rounded w-full min-h-[150px]"
                                            placeholder="Phòng trọ mặt tiền đường, gần trường học, siêu thị, thuận tiện đi lại..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang tạo bài đăng...' : 'Tạo bài đăng'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                <div className="space-y-4">
                    <div className="mb-4">
                        <label className="block text-gray-700">Thêm Hình Ảnh</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setImages(Array.from(e.target.files))}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                        <p className="text-gray-500 mt-2">
                            Bạn đã tải lên {images.length} hình ảnh. Cần ít nhất 4 hình ảnh.
                        </p>
                        <button
                            onClick={handleImageUpload}
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full"
                        >
                            Tải lên
                        </button>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Vị Trí Trên Google Map</h2>
                        <div className="bg-gray-300 h-64 rounded-lg flex items-center justify-center">
                            Google Map Placeholder
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
