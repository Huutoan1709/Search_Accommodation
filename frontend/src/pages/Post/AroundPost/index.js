import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { endpoints } from '../../../API';
import { FaLocationDot } from 'react-icons/fa6';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 4;

const AroundPost = ({ city, district }) => {
    const [posts, setPosts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAroundPosts = async () => {
            try {
                const res = await API.get(`${endpoints['post']}?city=${city}&district=${district}&limit=12`);
                setPosts(res.data.results);
            } catch (err) {
                console.error(err);
            }
        };

        if (city && district) {
            fetchAroundPosts();
        }
    }, [city, district]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + ITEMS_PER_PAGE >= posts.length ? 0 : prevIndex + ITEMS_PER_PAGE));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex - ITEMS_PER_PAGE < 0 ? posts.length - ITEMS_PER_PAGE : prevIndex - ITEMS_PER_PAGE,
        );
    };

    return (
        <div className="w-[1024px] m-auto mt-8 bg-white rounded-lg p-6 relative shadow-md border ">
            <h3 className="font-semibold  text-black-500 text-2xl pb-2">Tin đăng cùng khu vực ({posts.length})</h3>

            {posts.length > 0 ? (
                <div className="relative mt-4">
                    {/* Nút bấm trái */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-[-30px] top-1/2 -translate-y-1/2 bg-amber-300 shadow-md p-2 rounded-full z-10"
                    >
                        <IoIosArrowBack className="text-gray-600 text-2xl" />
                    </button>

                    {/* Hiển thị 4 bài đăng */}
                    <div className="overflow-hidden relative">
                        <motion.div
                            className="flex gap-4"
                            animate={{ x: -currentIndex * (100 / ITEMS_PER_PAGE) + '%' }}
                            transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                        >
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="min-w-[24%] bg-white rounded-lg overflow-hidden cursor-pointer"
                                >
                                    <img
                                        src={post?.images[0]?.url}
                                        alt={post?.title}
                                        className="w-full h-[160px] object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                            {post?.title?.length > 50 ? `${post?.title.slice(0, 47)}...` : post?.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xl">
                                            <p className="text-green-600 font-semibold">{post?.room?.price} triệu</p>
                                            <p className="text-green-600 font-semibold">{post?.room?.area}m²</p>
                                        </div>
                                        <div className="flex gap-1 items-center mt-2 text-gray-600 text-xl">
                                            <FaLocationDot size={12} color="red" />
                                            <p>{`${post?.room?.district}`}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Nút bấm phải */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-[-30px] top-1/2 -translate-y-1/2 bg-amber-300 shadow-md p-2 rounded-full z-10"
                    >
                        <IoIosArrowForward className="text-gray-600 text-2xl" />
                    </button>
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-4">Chưa có bài đăng nào...</p>
            )}
        </div>
    );
};

export default AroundPost;
