import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { BiRuler, BiBed, BiMoney, BiCabinet } from 'react-icons/bi';
import { MdOutlineGavel } from 'react-icons/md';
import { PiMapPinAreaFill, PiWatchLight } from 'react-icons/pi';

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
    };

    const title = post.title.length > 50 ? `${post.title.slice(0, 50)}...` : post.title;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg md:max-w-[600px] p-0 overflow-hidden">
                {/* Slider for images */}
                <div className="slider-container">
                    <Slider {...settings}>
                        {post.images.map((image, index) => (
                            <div key={index} className="flex justify-center">
                                <img src={image.url} alt={`Image ${index}`} className="w-full h-[400px] object-cover" />
                            </div>
                        ))}
                    </Slider>
                </div>

                {/* Information card with transparent background */}
                <div className="absolute top-0 right-0 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 m-4 z-10 max-w-[300px] h-auto">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
                    <div className="mb-2">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between text-gray-600 mb-1">
                                <div className="flex items-center">
                                    <span className="mr-2 text-gray-700">{feature.icon}</span>
                                    <span className="font-base">{feature.label}</span>
                                </div>
                                <span>{feature.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Contact Info in Input Fields */}
                    <div className="mt-2">
                        <h3 className="font-semibold text-gray-800">Liên hệ</h3>
                        <div className="flex flex-col space-y-2">
                            <div>
                                <label className="block text-gray-700">Tên</label>
                                <input
                                    type="text"
                                    value={post.user.first_name}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={post.user.phone}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Button */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={onClose}
                            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
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
