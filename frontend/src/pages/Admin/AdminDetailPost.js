import React from 'react';
import Slider from 'react-slick';
import { IoCloseOutline } from 'react-icons/io5';
import { FaUserCircle, FaEnvelope, FaPhone } from 'react-icons/fa';
import { BiArea, BiMoney, BiHomeAlt, BiMap } from 'react-icons/bi';

function AdminDetailPost({ post, onClose }) {
    if (!post) return null;

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true,
        cssEase: "linear",
        arrows: true,
        adaptiveHeight: true
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-full md:w-[500px] h-full bg-white shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-white sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Chi tiết bài đăng</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100vh-64px)]">
                    {/* Image Slider */}
                    <div className="relative mb-6">
                        <Slider {...settings}>
                            {post.images.map((image) => (
                                <div key={image.id} className="aspect-w-16 aspect-h-9">
                                    <img 
                                        src={image.url} 
                                        alt={post.title} 
                                        className="w-full h-[300px] object-cover"
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>

                    {/* Post Details */}
                    <div className="px-6 space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {post.content.replace(/(<([^>]+)>)/gi, '')}
                            </p>
                        </div>

                        {/* Property Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <BiMoney size={20} />
                                    <span className="font-semibold">Giá thuê</span>
                                </div>
                                <p className="text-lg font-bold text-gray-800">{post.room.price} triệu/tháng</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <BiArea size={20} />
                                    <span className="font-semibold">Diện tích</span>
                                </div>
                                <p className="text-lg font-bold text-gray-800">{post.room.area} m²</p>
                            </div>
                        </div>

                        {/* Location & Type */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <BiHomeAlt size={24} className="text-gray-500 mt-1" />
                                <div>
                                    <p className="font-semibold text-gray-700">Loại phòng</p>
                                    <p className="text-gray-600">{post.room.room_type.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <BiMap size={24} className="text-gray-500 mt-1" />
                                <div>
                                    <p className="font-semibold text-gray-700">Địa chỉ</p>
                                    <p className="text-gray-600">
                                        {post.room.other_address}, {post.room.ward}, {post.room.district}, {post.room.city}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Owner Information */}
                        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                            <h4 className="text-xl font-bold text-gray-800">Thông tin chủ nhà</h4>
                            <div className="flex items-center gap-4">
                                <img
                                    src={post.user.avatar}
                                    alt={post.user.username}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FaUserCircle className="text-gray-500" />
                                        <p className="font-medium text-gray-800">
                                            {post.user.first_name} {post.user.last_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaEnvelope className="text-gray-500" />
                                        <p className="text-gray-600">{post?.user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaPhone className="text-gray-500" />
                                        <p className="text-gray-600">{post?.user.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDetailPost;
