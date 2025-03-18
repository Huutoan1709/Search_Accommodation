import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import uploadimage from '../../../assets/upload-image.png';
import { notifyError, notifySuccess, notifyWarning } from '../../../components/ToastManager';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FaLock, FaCalendarAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import MapBox from '../../../components/MapBox';

import CreateModalVideo from '../../../components/CreateModalVideo';
import { set } from 'lodash';
const CreatePost = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [images, setImages] = useState([]);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [amenities, setAmenities] = useState({});
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [newPostId, setNewPostId] = useState(null);
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

        const fetchAmenities = async () => {
            try {
                const response = await authApi().get(endpoints.amenities);
                const amenitiesMap = {};
                response.data.forEach((amenity) => {
                    amenitiesMap[amenity.id] = amenity.name;
                });
                setAmenities(amenitiesMap);
            } catch (error) {
                console.error('Failed to fetch amenities:', error);
            }
        };

        fetchAmenities();
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

            const response = await authApi().post(endpoints.post, postData);
            const postId = response.data.id;
            setNewPostId(postId);

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
            setShowVideoModal(true);
            setPostTitle('');
            setPostContent('');
            setSelectedRoom('Chọn phòng');
            setImages([]);
        } catch (error) {
            console.error('Failed to create post or upload images:', error);
            notifyError('Tạo bài đăng hoặc tải lên hình ảnh thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const generateTitle = () => {
        if (
            roomDetails.room_type &&
            roomDetails.other_address &&
            roomDetails.ward &&
            roomDetails.district &&
            roomDetails.city
        ) {
            const title = `Cho thuê ${roomDetails.room_type.name} tại ${roomDetails.other_address}, ${roomDetails.ward}, ${roomDetails.district}, ${roomDetails.city} chất lượng`;
            setPostTitle(title);
        }
    };
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-medium mb-8 text-gray-800">Tạo Bài Đăng Mới</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handlePostCreation} className="space-y-8">
                        <div className="space-y-2">
                            <label className="block text-red-400 font-semibold">Chọn phòng có sẵn</label>
                            <select
                                className="border border-gray-300 p-3 rounded-lg w-full focus:ring focus:ring-blue-500"
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
                            <div className="w-full">
                                {/* Thông tin phòng */}
                                <div>
                                    <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
                                        <i className="fas fa-info-circle mr-2"></i> Thông Tin Phòng
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-600">Giá (triệu/tháng)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="border border-gray-300 p-3 rounded-lg w-full"
                                                    value={roomDetails?.price}
                                                    readOnly
                                                />
                                                <span className="absolute inset-y-0 right-4 flex items-center">
                                                    <FaLock className="text-gray-400" />
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-600">Diện tích (m2)</label>
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-3 rounded-lg w-full"
                                                value={roomDetails?.area}
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-600">Loại Phòng</label>
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-3 rounded-lg w-full"
                                                value={roomDetails?.room_type?.name}
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-600">Mã tin</label>
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-3 rounded-lg w-full"
                                                value={roomDetails?.id}
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-600">Ngày tạo</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="border border-gray-300 p-3 rounded-lg w-full"
                                                    value={formatDate(roomDetails?.created_at)}
                                                    readOnly
                                                />
                                                <span className="absolute inset-y-0 right-4 flex items-center">
                                                    <FaCalendarAlt className="text-gray-400" />
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-600">Địa chỉ</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="border border-gray-300 p-3 rounded-lg w-full"
                                                    value={`${roomDetails?.ward}, ${roomDetails?.district}, ${roomDetails?.city}`}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-600">Số nhà</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="border border-gray-300 p-3 rounded-lg w-full"
                                                    value={`${roomDetails?.other_address}`}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        {/* Thêm trường nội thất có sẵn */}
                                        <div>
                                            <label className="block text-gray-600">Nội thất có sẵn</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="border border-gray-300 p-3 rounded-lg w-full"
                                                    value={roomDetails?.amenities.map((id) => amenities[id]).join(', ')}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Liên hệ */}
                                <div className="mt-6">
                                    <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
                                        <i className="fas fa-user-circle mr-2"></i> Liên Hệ
                                    </h2>
                                    <div className="bg-gray-100 p-4 rounded-lg shadow">
                                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                            <p>{currentUser?.first_name}</p>
                                            <p>{currentUser?.last_name}</p>
                                        </h2>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <FaPhone className="text-pink-500 mr-2" />
                                                <span>{currentUser?.phone}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaEnvelope className="text-pink-500 mr-2" />
                                                <span>{currentUser?.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-md space-y-4 mt-6">
                                    <h2 className="text-2xl font-bold text-red-400">Hình ảnh</h2>
                                    <p className="text-md text-gray-500 mb-2">
                                        Cập nhật hình ảnh rõ ràng sẽ cho thuê nhanh hơn
                                    </p>
                                    <div className="min-h-[180px] border-dashed border-2 border-gray-300 p-6 flex justify-center items-center">
                                        <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
                                            <img src={uploadimage} alt="Upload" className="w-32 h-24 object-cover" />
                                            <span className="mt-2 font-medium text-blue-500">Thêm Ảnh</span>
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
                                                    className="w-full h-40 object-cover border border-gray-300 rounded"
                                                />
                                                <button
                                                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                                                    className="absolute top-1 right-1 bg-red-400 text-white p-1 rounded"
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

                                <div className="space-y-4 mt-6">
                                    <label className="block text-red-400 font-semibold text-2xl">
                                        Tiêu đề bài đăng
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            value={postTitle}
                                            onChange={(e) => setPostTitle(e.target.value)}
                                            className="border border-gray-300 p-3 rounded-lg w-full focus:ring focus:ring-red-400"
                                            placeholder="Phòng trọ giá rẻ tại quận 1..."
                                        />
                                        <button
                                            type="button"
                                            onClick={generateTitle}
                                            className="flex items-center justify-center font-base rounded-lg ml-4 bg-green-500 text-white px-4 py-2 hover:bg-green-600"
                                        >
                                            Tiêu đề tự động
                                        </button>
                                    </div>

                                    <label className="block text-red-500 font-semibold text-2xl">
                                        Nội dung bài đăng
                                    </label>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={postContent}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setPostContent(data);
                                        }}
                                    />
                                    {postContent.length < 10 && (
                                        <p className="text-red-500">Nội dung bài đăng cần ít nhất 10 ký tự.</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <button
                                        type="submit"
                                        className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${
                                            loading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang tạo bài đăng...' : 'Tạo bài đăng'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                {selectedRoom && roomDetails.latitude && roomDetails.longitude && (
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold mb-4">Bản đồ</h2>
                        <MapBox latitude={roomDetails.latitude} longitude={roomDetails.longitude} />

                        <div className="bg-yellow-100 p-4 rounded-lg mt-4">
                            <h3 className="font-bold">Lưu ý:</h3>
                            <ul className="list-disc list-inside pl-4">
                                <li>Khi đăng tin phải điền đầy đủ thông tin các trường nội dung, tiêu đề.</li>
                                <li>Hình ảnh bắt buộc phải có ít nhất 4 ảnh.</li>
                                <li>Nội dung phải viết bằng tiếng Việt có dấu</li>
                                <li>Không đăng tin trùng lặp</li>
                                <li>
                                    Tin đăng có hình ảnh rõ ràng sẽ được xem và gọi gấp nhiều lần so với tin rao không
                                    có ảnh. Hãy đăng ảnh để được giao dịch nhanh chóng!
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            <CreateModalVideo isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} postId={newPostId} />
        </div>
    );
};
export default CreatePost;
