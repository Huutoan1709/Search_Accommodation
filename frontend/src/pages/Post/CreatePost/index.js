import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import uploadimage from '../../../assets/upload-image.png';
import { notifyError, notifySuccess, notifyWarning } from '../../../components/ToastManager';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FaLock, FaCalendarAlt, FaPhone, FaEnvelope, FaVideo } from 'react-icons/fa';
import MapBox from '../../../components/MapBox';
import generateContent from '../../../components/SmartDescriptionGenerator';
import CreateModalVideo from '../../../components/CreateModalVideo';
import generateTitle from '../../../components/SmartTitleGenerator';
import { BsStars } from "react-icons/bs";
import { set } from 'lodash';
import CreateRoom from '../../Room/CreateRoom';
import Loading from '../../../components/Loading';

const CreatePost = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [images, setImages] = useState([]);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [amenities, setAmenities] = useState({});
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [newPostId, setNewPostId] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [postTypes, setPostTypes] = useState([]);
    const [selectedPostType, setSelectedPostType] = useState(null);
    const [video, setVideo] = useState(null);

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

        const fetchPostTypes = async () => {
            try {
                const response = await authApi().get(endpoints.posttype);
                setPostTypes(response.data);
            } catch (error) {
                console.error('Failed to fetch post types:', error);
            }
        };

        fetchAmenities();
        fetchRooms();
        fetchCurrentUser();
        fetchPostTypes();
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

        if (!selectedPostType) {
            notifyWarning('Vui lòng chọn gói tin đăng.');
            return;
        }

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

        try {
            setLoading(true);
            
            // 1. Creating post
            setLoadingMessage('Đang tạo bài đăng...');
            const postData = {
                title: postTitle,
                content: postContent,
                room: selectedRoom,
                post_type: selectedPostType.id
            };
            const response = await authApi().post(endpoints.post, postData);
            const postId = response.data.id;
            setNewPostId(postId);

            // 2. Uploading images
            setLoadingMessage('Đang tải hình ảnh lên...');
            const formData = new FormData();
            images.forEach((image) => {
                formData.append('images', image);
            });
            await authApi().post(endpoints.postimage(postId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 3. Uploading video if exists
            if (video) {
                setLoadingMessage('Đang tải video lên...');
                const videoFormData = new FormData();
                videoFormData.append('video', video);
                await authApi().post(endpoints.postvideo(postId), videoFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            // 4. Processing payment
            setLoadingMessage('Đang xử lý thanh toán...');
            const paymentData = {
                post_id: postId,
                post_type_id: selectedPostType.id,
                amount: selectedPostType.price
            };

            const paymentResponse = await authApi().post(endpoints.paymentcreate, paymentData);

            if (paymentResponse.data.payment_url) {
                notifySuccess('Tạo bài đăng thành công! Chuyển hướng đến trang thanh toán...');
                setTimeout(() => {
                    window.location.href = paymentResponse.data.payment_url;
                }, 1500);
            }

        } catch (error) {
            console.error('Failed to process:', error);
            notifyError('Có lỗi xảy ra trong quá trình xử lý.');
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    const handleGenerateContent = async () => {
        try {
            setIsGenerating(true);
            const content = await generateContent(roomDetails, amenities);
            setPostContent(content);
            notifySuccess('Đã tạo nội dung thành công!');
        } catch (error) {
            notifyError(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const handlegenerateTitle = async () => {
        if (!roomDetails) {
            notifyWarning('Vui lòng chọn phòng trước.');
            return;
        }
    
        try {
            setIsGeneratingTitle(true);
            const title = await generateTitle(roomDetails);
            setPostTitle(title);
            notifySuccess('Đã tạo tiêu đề thành công!');
        } catch (error) {
            notifyError(error.message);
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const handleImageUpload = (e) => {
        const newImages = Array.from(e.target.files);
        const totalImages = images.length + newImages.length;
        
        if (totalImages > 10) {
            notifyWarning('Bạn chỉ có thể upload tối đa 10 ảnh');
            return;
        }
        
        setImages(prevImages => [...prevImages, ...newImages]);
        e.target.value = ''; // Reset input
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (100MB limit)
            if (file.size > 100 * 1024 * 1024) {
                notifyWarning('Video không được vượt quá 100MB');
                return;
            }
            setVideo(file);
        }
        e.target.value = ''; // Reset input
    };

    const handleCloseCreateRoom = async () => {
        setShowCreateRoom(false);
        try {
            // Fetch lại danh sách phòng
            const response = await authApi().get(endpoints.myrooms);
            const availableRooms = response.data.filter((room) => !room.has_post);
            setRooms(availableRooms);
            
            // Tự động chọn phòng mới nhất
            if (availableRooms.length > 0) {
                const newestRoom = availableRooms[availableRooms.length - 1];
                handleRoomSelect(newestRoom.id);
            }
        } catch (error) {
            console.error('Failed to fetch updated rooms:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            {loading ? (
                <Loading message={loadingMessage} />
            ) : (
                <>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4 sm:mb-8 text-gray-800">
                        Tạo Bài Đăng Mới
                    </h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                        <div className="lg:col-span-2 space-y-4 sm:space-y-8">
                            <form onSubmit={handlePostCreation} className="space-y-4 sm:space-y-8">
                                {/* Room Selection Section */}
                                <div className="space-y-2">
                                    <label className="block text-red-400 font-semibold text-lg sm:text-xl">
                                        Chọn phòng có sẵn
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <select
                                            className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full"
                                            onChange={(e) => handleRoomSelect(e.target.value)}
                                            value={selectedRoom || ""}
                                        >
                                            <option value="">Chọn phòng</option>
                                            {rooms.map((room) => (
                                                <option key={room.id} value={room.id}>
                                                    Căn phòng {room?.ward} - {room?.district}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateRoom(true)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 sm:py-3 rounded-lg"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                                            </svg>
                                            <span className="hidden sm:inline">Thêm phòng mới</span>
                                            <span className="sm:hidden">Thêm</span>
                                        </button>
                                    </div>
                                </div>

                                {selectedRoom && (
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Room Info Section */}
                                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                                            <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-4">
                                                Thông Tin Phòng
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                        {/* Image Upload Section */}
                                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                                            <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">
                                                Hình ảnh(*)
                                            </h2>
                                            <div className="min-h-[120px] sm:min-h-[180px] border-dashed border-2 border-gray-300 p-4 sm:p-6">
                                                <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
                                                    <img src={uploadimage} alt="Upload" className="w-24 sm:w-32 h-20 sm:h-24" />
                                                    <span className="mt-2 font-medium text-blue-500">Thêm Ảnh</span>
                                                    <p className="text-base sm:text-lg text-gray-500">{images.length} / 10 ảnh</p>
                                                </label>
                                                <input
                                                    id="upload"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </div>
                                            {/* Image Preview Grid */}
                                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                                                {images.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={URL.createObjectURL(image)}
                                                            alt={`Uploaded ${index + 1}`}
                                                            className="w-full h-40 object-cover border border-gray-300 rounded-lg transition duration-200 group-hover:opacity-75"
                                                        />
                                                        <button
                                                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-200 hover:bg-red-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-xl ${images.length < 4 ? 'text-red-500' : 'text-green-500'}`}>
                                                        {images.length < 4 
                                                            ? `Cần thêm ít nhất ${4 - images.length} ảnh nữa` 
                                                            : 'Đã đủ số lượng ảnh tối thiểu'}
                                                    </p>
                                                    <p className="text-xl text-gray-500">
                                                        Tối đa 10 ảnh
                                                    </p>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                                    <div 
                                                        className={`h-2.5 rounded-full transition-all duration-300 ${
                                                            images.length < 4 ? 'bg-red-500' : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${Math.min((images.length / 10) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow-md space-y-4 mt-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-2xl font-bold text-red-400">Video</h2>
                                                <p className="text-md text-gray-500">
                                                    Thêm video để tăng độ tin cậy cho bài đăng
                                                </p>
                                            </div>
                                            
                                            <div className="min-h-[180px] border-dashed border-2 border-gray-300 p-6 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 transition-all duration-300"
                                                onClick={() => document.getElementById('videoUpload').click()}
                                            >
                                                <FaVideo className="text-4xl text-gray-400 mb-3" />
                                                <span className="font-medium text-blue-500">Thêm Video</span>
                                                <p className="text-gray-500 mt-2">
                                                    {video ? `Đã chọn: ${video.name}` : 'Chưa có video nào được chọn'}
                                                </p>
                                                <input
                                                    id="videoUpload"
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoUpload}
                                                    className="hidden"
                                                />
                                            </div>

                                            {video && (
                                                <div className="relative mt-4">
                                                    <video
                                                        src={URL.createObjectURL(video)}
                                                        className="w-full max-h-[300px] rounded-lg"
                                                        controls
                                                    />
                                                    <button
                                                        onClick={() => setVideo(null)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 mt-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <label className="block text-red-400 font-semibold text-2xl mb-2">
                                                            Tiêu đề bài đăng(*)
                                                        </label>
                                                        <button
                                                                type="button"
                                                                onClick={handlegenerateTitle}
                                                                title='Tạo tiêu đề bằng AI'
                                                                className={`min-w-[216px] flex items-center justify-center gap-2 font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl ${
                                                                    isGeneratingTitle ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                                disabled={isGeneratingTitle}
                                                            >
                                                                <BsStars className="text-lg" size={20}/>
                                                                {isGeneratingTitle ? 'Đang tạo...' : 'Tạo tiêu đề AI'}
                                                            </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={postTitle}
                                                            onChange={(e) => setPostTitle(e.target.value)}
                                                            className="border border-gray-300 p-3 rounded-lg w-full focus:ring focus:ring-red-400"
                                                            placeholder="Phòng trọ giá rẻ tại quận 1..."
                                                        />
                                                        
                                                    </div>
                                                </div>
                                            </div>
                                        
                                            <div className="space-y-2">
                                                <div className='flex items-center justify-between mb-6'>
                                                    <label className="block text-red-400 font-semibold text-2xl mb-2">
                                                        Nội dung bài đăng(*)
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={handleGenerateContent}
                                                        className={` min-w-[216px] flex items-center justify-center gap-2 font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl ${
                                                            isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                        disabled={isGenerating}
                                                    >
                                                        <BsStars  className="text-xl" size={20}/>
                                                        {isGenerating ? 'Đang tạo nội dung...' : 'Tạo nội dung bằng AI'}
                                                    </button>
                                                </div>
                                                <CKEditor
                                                    editor={ClassicEditor}
                                                    data={postContent}
                                                    onChange={(event, editor) => {
                                                        const data = editor.getData();
                                                        setPostContent(data);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 mt-6">
                                            <h2 className="text-2xl font-bold text-red-400 mb-4">Gói tin đăng(*) </h2>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                {postTypes.map((type) => (
                                                    <div
                                                        key={type.id}
                                                        onClick={() => setSelectedPostType(type)}
                                                        className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 
                                                            ${selectedPostType?.id === type.id 
                                                                ? 'border-blue-500 bg-blue-50' 
                                                                : 'border-gray-200 hover:border-blue-300'}`}
                                                    >
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-xl font-bold text-gray-800">
                                                                {type.name}
                                                            </h3>
                                                            <span className={`px-4 py-1 rounded-full text-sm font-medium 
                                                                ${type.name === 'VIP' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {type.name}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-2xl font-bold text-green-600">
                                                                {type.price.toLocaleString('vi-VN')}đ
                                                            </p>
                                                            <p className="text-gray-600">
                                                                Thời hạn: {type.duration} ngày
                                                            </p>
                                                            <p className="text-gray-500 text-sm">
                                                                {type.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                
                                        <button
                                            type="submit"
                                            className={`flex items-center justify-center gap-2 w-full font-semibold rounded-lg text-white px-6 py-3 transition-all duration-300 shadow-lg hover:shadow-xl mb-4 ${
                                                loading 
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                                                    : selectedPostType?.name === 'VIP'
                                                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
                                                        : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
                                            }`}
                                            disabled={loading || !selectedPostType}
                                        >
                                            {loading ? (
                                                'Đang xử lý...'
                                            ) : selectedPostType ? (
                                                <>
                                                    Tạo tin đăng với gói {selectedPostType.name} - {selectedPostType.price.toLocaleString('vi-VN')}đ
                                                </>
                                            ) : (
                                                'Vui lòng chọn gói tin đăng'
                                            )}
                                        </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                        {selectedRoom && roomDetails.latitude && roomDetails.longitude && (
                            <div className="lg:col-span-1">
                                <div className="sticky top-4">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-400">Bản đồ</h2>
                                    <div className="h-[250px] sm:h-[300px] rounded-lg overflow-hidden">
                                        <MapBox latitude={roomDetails.latitude} longitude={roomDetails.longitude} />
                                    </div>
                                    
                                    {/* Post Guidelines Section */}
                                    <div className="bg-yellow-100 p-4 rounded-lg mt-4">
                                        <h3 className="font-bold text-lg mb-2">Lưu ý khi đăng tin:</h3>
                                        <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
                                            <li>Khi đăng tin phải điền đầy đủ thông tin các trường nội dung, tiêu đề.</li>
                                            <li>Hình ảnh bắt buộc phải có ít nhất 4 ảnh.</li>
                                            <li>Nội dung phải viết bằng tiếng Việt có dấu.</li>
                                            <li>Không đăng tin trùng lặp.</li>
                                            <li>Tin đăng có hình ảnh rõ ràng sẽ được xem và gọi gấp nhiều lần so với tin rao không có ảnh. Hãy đăng ảnh để được giao dịch nhanh chóng!</li>
                                        </ul>
                                        
                                        {/* Additional Guidelines */}
                                        <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
                                            <h4 className="font-semibold text-red-500 mb-2">Quy định đăng tin:</h4>
                                            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-600">
                                                <li>Tin đăng phải có thông tin chính xác.</li>
                                                <li>Hình ảnh phải chụp thực tế từ căn phòng.</li>
                                                <li>Thông tin liên hệ phải chính xác.</li>
                                                <li>Không đăng tin với nội dung quảng cáo khác.</li>
                                                <li>Video nên quay rõ nét để người xem dễ hình dung.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {showCreateRoom && (
                        <CreateRoom 
                            onClose={handleCloseCreateRoom}
                            showEdit={false}
                        />
                    )}
                    
                    <CreateModalVideo isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} postId={newPostId} />
                </>
            )}
        </div>
    );
};
export default CreatePost;
