import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import API, { endpoints } from '../API';
import { useNavigate } from 'react-router-dom';
function MapViewModal({ isOpen, onClose }) {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: 10.8231,
        longitude: 106.6297,
    });
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [viewport, setViewport] = useState({
        width: '100%',
        height: '100%',
        latitude: 10.8231,
        longitude: 106.6297,
        zoom: 14,
    });
    const navigate = useNavigate();
    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
        onClose();
    };
    // Lấy vị trí hiện tại và cập nhật viewport
    useEffect(() => {
        if (isOpen && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setCurrentLocation(newLocation);
                    setViewport((prev) => ({
                        ...prev,
                        latitude: newLocation.latitude,
                        longitude: newLocation.longitude,
                    }));
                },
                (error) => {
                    console.error('Error getting location:', error);
                },
            );
        }
    }, [isOpen]);

    // Fetch bài đăng
    useEffect(() => {
        if (!isOpen) return;

        const fetchPosts = async () => {
            try {
                setLoading(true);
                const res = await API.get(endpoints.post);
                // Lọc chỉ lấy các bài đăng có tọa độ
                const postsWithCoordinates = res.data.results.filter(
                    (post) => post.room && post.room.latitude && post.room.longitude,
                );
                console.log(postsWithCoordinates);
                setPosts(postsWithCoordinates);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center ">
            <div className="relative w-[900px] h-[600px] rounded-lg overflow-hidden">
                <ReactMapGL
                    {...viewport}
                    onMove={(evt) => setViewport(evt.viewState)}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken="pk.eyJ1IjoiaHV1dG9hbjE3MDkiLCJhIjoiY204Y2lsZ20wMTg0ODJrb2xrM3RkbWI1MCJ9.78vKIOvNFkWeyR6IEB1W2w"
                >
                    {/* Marker cho vị trí hiện tại */}
                    <Marker latitude={currentLocation.latitude} longitude={currentLocation.longitude}>
                        <div className="flex flex-col items-center">
                            <div className="bg-blue-500 text-white px-2 py-1 rounded-md shadow-lg">Vị trí của bạn</div>
                            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                        </div>
                    </Marker>

                    {/* Markers cho các bài đăng */}
                    {posts.map((post) => (
                        <Marker key={post.id} latitude={post.room.latitude} longitude={post.room.longitude}>
                            <div className="cursor-pointer" onClick={() => setSelectedPost(post)}>
                                <div className="flex flex-col items-center">
                                    <div className="bg-black text-white font-bold px-2 py-1 rounded-md shadow-lg">
                                        {post.room.price} triệu
                                    </div>
                                    <div className="w-4 h-4 bg-black rounded-full border-2 border-white shadow-lg"></div>
                                </div>
                            </div>
                        </Marker>
                    ))}

                    {/* Popup khi click vào marker */}
                    {selectedPost && (
                        <Popup
                            latitude={selectedPost.room.latitude}
                            longitude={selectedPost.room.longitude}
                            closeButton={true}
                            closeOnClick={false}
                            onClose={() => setSelectedPost(null)}
                            anchor="bottom"
                            offset={15}
                        >
                            <div
                                className="flex p-1  max-w-[300px] cursor-pointer"
                                onClick={() => handlePostClick(selectedPost.id)}
                            >
                                {' '}
                                {/* Giảm kích thước ảnh */}
                                {selectedPost.images && selectedPost.images[0] && (
                                    <img
                                        src={selectedPost.images[0].url}
                                        alt={selectedPost.title}
                                        className="w-[30%] h-[60px] object-cover rounded mr-2 border-2 border-gray-500 "
                                    />
                                )}
                                <div className="w-[70%] flex flex-col gap-1">
                                    {' '}
                                    {/* Reduced gap */}
                                    <h3 className="font-bold  text-xl mb-1 truncate ">{selectedPost.title}</h3>
                                    <div className="flex gap-2">
                                        {' '}
                                        {/* Reduced gap */}
                                        <p className=" text-green-400 font-bold">{selectedPost.room.price} triệu - </p>
                                        <p className=" font-bold">{selectedPost.room.area} m²</p>
                                    </div>
                                    <p className="text-base text-gray-600">{selectedPost.room.room_type?.name}</p>
                                </div>
                            </div>
                        </Popup>
                    )}
                </ReactMapGL>

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 rounded-lg shadow-lg hover:bg-blue-500 z-10 bg-blue-400"
                >
                    <div className="flex items-center gap-2 p-2">
                        <FaTimes size={24} className="text-white" />
                        <span className="text-white font-medium">Đóng bản đồ</span>
                    </div>
                </button>

                {/* Loading indicator */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            <div className="loader"></div>
                            <p className="mt-2">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MapViewModal;
