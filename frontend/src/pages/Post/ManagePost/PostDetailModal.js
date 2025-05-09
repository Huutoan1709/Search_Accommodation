import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { BiRuler, BiBed, BiMoney, BiCabinet, BiX } from 'react-icons/bi';
import { MdOutlineGavel } from 'react-icons/md';
import { PiMapPinAreaFill, PiWatchLight } from 'react-icons/pi';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCallOutline } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa';

const PostDetailModal = ({ post, onClose }) => {
    if (!post) return null;

    const features = [
        { label: 'Diện tích', value: `${post.room.area} m²`, icon: <BiRuler size={20} /> },
        { label: 'Giá', value: `${post.room.price} triệu/tháng`, icon: <BiMoney size={20} /> },
        { label: 'Loại phòng', value: post.room.room_type?.name, icon: <BiBed size={20} /> },
        { label: 'Khu vực', value: post.room.city, icon: <PiMapPinAreaFill size={20} /> },
        {
            label: 'Ngày đăng',
            value: new Date(post.created_at).toLocaleDateString('vi-VN'),
            icon: <PiWatchLight size={20} />,
        },
        { label: 'Ngày hết hạn', value: calculateEndDate(post.created_at), icon: <PiWatchLight size={20} /> },
    ];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: true,
        customPaging: (i) => (
            <div className="w-2 h-2 mx-1 rounded-full bg-white opacity-50 hover:opacity-100 transition-opacity" />
        ),
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[1200px] overflow-hidden" // Increased from max-w-4xl to max-w-[1200px]
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-200 shadow-lg"
                    >
                        <BiX size={24} className="text-gray-600" />
                    </button>

                    <div className="grid grid-cols-5 gap-6"> {/* Changed from grid-cols-2 to grid-cols-5 */}
                        {/* Left side - Image Slider */}
                        <div className="col-span-3 relative h-[650px]"> {/* Changed col span and increased height */}
                            <Slider {...settings} className="h-full">
                                {post.images.map((image, index) => (
                                    <div key={index} className="h-[650px]"> {/* Increased height */}
                                        <img
                                            src={image.url}
                                            alt={`Image ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                ))}
                            </Slider>
                        </div>

                        {/* Right side - Information */}
                        <div className="col-span-2 p-6 pr-8 overflow-y-auto max-h-[650px] scrollbar-hide"> {/* Adjusted col span and height */}
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 leading-tight"> {/* Increased text size */}
                                {post.title}
                            </h2>

                            {/* Features Grid - kept 2 columns but made items larger */}
                            <div className="grid grid-cols-2 gap-5 mb-8"> {/* Increased gap */}
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-sm" // Added shadow and increased padding
                                    >
                                        <span className="text-blue-500 mr-4">{feature.icon}</span>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{feature.label}</p>
                                            <p className="font-medium text-gray-800 text-lg">{feature.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Information - made more spacious */}
                            <div className="bg-blue-50 rounded-xl p-6 mb-8"> {/* Increased padding */}
                                <h3 className="font-semibold text-blue-800 text-xl mb-5 flex items-center gap-3"> {/* Increased text size and spacing */}
                                    <FaUserCircle size={24} />
                                    Thông tin liên hệ
                                </h3>
                                <div className="space-y-5"> {/* Increased spacing */}
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                        <FaUserCircle size={20} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Tên chủ nhà</p>
                                            <p className="font-medium text-gray-800">{post.user.first_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                        <IoCallOutline size={20} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Số điện thoại</p>
                                            <p className="font-medium text-gray-800">{post.user.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions - made buttons larger */}
                            <div className="flex justify-end gap-4"> {/* Increased gap */}
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-lg" // Increased padding and text size
                                >
                                    Đóng
                                </button>
                                <a
                                    href={`tel:${post.user.phone}`}
                                    className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-3 text-lg" // Increased padding and text size
                                >
                                    <IoCallOutline size={24} />
                                    Gọi ngay
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const calculateEndDate = (startDate) => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + 1); // Giả sử thời gian thuê là 1 tháng
    return start.toLocaleDateString('vi-VN');
};

PostDetailModal.propTypes = {
    post: PropTypes.shape({
        title: PropTypes.string.isRequired,
        images: PropTypes.arrayOf(
            PropTypes.shape({
                url: PropTypes.string.isRequired,
            }),
        ).isRequired,
        room: PropTypes.shape({
            area: PropTypes.number.isRequired,
            room_type: PropTypes.shape({
                name: PropTypes.string,
            }),
            city: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
        }).isRequired,
        created_at: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        user: PropTypes.shape({
            first_name: PropTypes.string.isRequired,
            phone: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default PostDetailModal;
