import React from 'react';
import Slider from 'react-slick';

function AdminDetailPost({ post, onClose }) {
    if (!post) return null;

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true,
    };

    return (
        <div
            className={`fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-lg z-50 transform transition-transform duration-500 ease-in-out ${
                post ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="p-4 flex justify-between items-center border-b bg-white">
                <h2 className="text-2xl font-semibold">Chi tiết bài đăng</h2>
                <button
                    onClick={onClose}
                    className="text-3xl font-bold text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                    &times;
                </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
                <div className="mb-5">
                    <Slider {...settings}>
                        {post.images.map((image) => (
                            <div key={image.id}>
                                <img src={image.url} alt={post.title} className="w-full h-64 object-cover rounded-lg" />
                            </div>
                        ))}
                    </Slider>
                </div>

                <h3 className="text-2xl font-semibold">{post.title}</h3>
                <p className="text-xl">{post.content.replace(/(<([^>]+)>)/gi, '')}</p>
                <p className="text-xl ">Giá: {post.room.price} triệu/tháng</p>
                <p className="textxl ">Diện tích: {post.room.area} m²</p>
                <p className="text-xl ">
                    Địa chỉ: {post.room.other_address}, {post.room.ward}, {post.room.district}, {post.room.city}
                </p>
                <p className="text-xl ">Loại phòng: {post.room.room_type.name}</p>

                <div className="bg-slate-200 p-3 rounded-md">
                    <h4 className="text-2xl font-semibold ">Thông tin chủ nhà:</h4>
                    <div className="flex items-center space-x-4 gap-2">
                        <img
                            src={post.user.avatar}
                            alt={post.user.username}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="items-center">
                            <p>
                                {post.user.first_name} {post.user.last_name}
                            </p>
                            <p>{post?.user.email}</p>
                            <p>{post?.user.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDetailPost;
