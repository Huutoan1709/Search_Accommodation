import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import uploadimage from '../../../assets/upload-image.png';
import { notifyError, notifySuccess, notifyWarning } from '../../../components/ToastManager';

const CreatePost = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [images, setImages] = useState([]);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch rooms and current user
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await authApi().get(endpoints.myrooms);
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

    const handleRoomSelect = async (roomId) => {
        try {
            const response = await authApi().get(endpoints.roomdetail(roomId));
            setRoomDetails(response.data);
            setSelectedRoom(roomId);
        } catch (error) {
            console.error('Failed to fetch room details:', error);
        }
    };

    const handlePostCreation = async (e) => {
        e.preventDefault();

        if (!selectedRoom) {
            notifyWarning('Vui lòng chọn phòng.');
            return;
        }

        if (images.length < 4) {
            notifyError('Bạn cần tải lên ít nhất 4 hình ảnh.');
            return;
        }

        if (!postTitle || !postContent) {
            notifyWarning('Vui lòng điền đủ tiêu đề và nội dung.');
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

            // Tạo bài đăng
            const response = await authApi().post(endpoints.post, postData);
            const postId = response.data.id; // Lấy ID của bài đăng

            // Tải hình ảnh lên với ID của bài đăng
            const formData = new FormData();
            images.forEach((image) => {
                formData.append('images', image);
            });

            await authApi().post(endpoints.postimage(postId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            notifySuccess('Tạo bài đăng và tải lên hình ảnh thành công!');

            // Reset form sau khi thành công
            setPostTitle('');
            setPostContent('');
            setSelectedRoom(null);
            setImages([]);
        } catch (error) {
            console.error('Failed to create post or upload images:', error);
            notifyError('Tạo bài đăng hoặc tải lên hình ảnh thất bại.');
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
                            <label className="block text-gray-700 font-medium mb-2">Danh sách phòng chưa đăng</label>
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
                                {/* Thông tin phòng */}
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h2 className="text-2xl font-semibold mb-4">Thông tin phòng</h2>
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
                                        <strong>Số nhà, đường:</strong> {roomDetails?.other_address}
                                    </p>
                                </div>

                                {/* Upload hình ảnh */}
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h2 className="text-2xl font-semibold mb-4">Hình ảnh</h2>
                                    <p>Cập nhật hình ảnh rõ ràng sẽ cho thuê nhanh hơn</p>
                                    <div className="min-h-[180px] border-dashed border-2 border-gray-300 p-4 flex justify-center items-center">
                                        <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
                                            <img src={uploadimage} alt="Upload" className="w-20 h-20" />
                                            <span className="mt-2 font-semibold">Thêm Ảnh</span>
                                        </label>
                                        <input
                                            id="upload"
                                            type="file"
                                            multiple
                                            onChange={(e) => setImages(Array.from(e.target.files))}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="mt-4 grid grid-cols-4 gap-4">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt="Uploaded"
                                                    className="w-full h-40 object-cover"
                                                />
                                                <button
                                                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-gray-500 mt-2">
                                        Bạn đã tải lên {images.length} hình ảnh. Cần ít nhất 4 hình ảnh.
                                    </p>
                                </div>

                                {/* Tiêu đề bài đăng */}
                                <div className="space-y-4">
                                    <label className="block text-gray-700">Tiêu đề bài đăng</label>
                                    <input
                                        type="text"
                                        value={postTitle}
                                        onChange={(e) => setPostTitle(e.target.value)}
                                        className="border border-gray-300 p-2 rounded w-full"
                                        placeholder="Phòng trọ giá rẻ tại quận 1..."
                                    />

                                    <label className="block text-gray-700">Nội dung bài đăng</label>
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        className="border border-gray-300 p-2 rounded w-full min-h-[150px]"
                                        placeholder="Phòng trọ mặt tiền đường, gần trường học, siêu thị..."
                                    />
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
            </div>
        </div>
    );
};

export default CreatePost;
