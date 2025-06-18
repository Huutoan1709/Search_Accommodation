import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { endpoints } from '../../../API';
import { FaLocationDot } from 'react-icons/fa6';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = {
    mobile: 1,
    tablet: 2,
    desktop: 4
};

const AroundPost = ({ city, district, currentPostId, userId }) => {
    const [posts, setPosts] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userPostsIndex, setUserPostsIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const controls = useAnimation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAroundPosts = async () => {
            try {
                const res = await API.get(`${endpoints['post']}?city=${city}&district=${district}&limit=12`);
                const filteredPosts = res.data.results.filter((post) => post.id !== currentPostId);
                setPosts(filteredPosts);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchUserPosts = async () => {
            try {
                const res = await API.get(`${endpoints['post']}?user=${userId}`);
                const filteredUserPosts = res.data.results.filter((post) => post.id !== currentPostId);
                setUserPosts(filteredUserPosts);
            } catch (err) {
                console.error(err);
            }
        };

        if (city && district) {
            fetchAroundPosts();
        }
        if (userId) {
            fetchUserPosts();
        }
    }, [city, district, currentPostId, userId]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + ITEMS_PER_PAGE.desktop >= posts.length ? 0 : prevIndex + ITEMS_PER_PAGE.desktop));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex - ITEMS_PER_PAGE.desktop < 0 ? posts.length - ITEMS_PER_PAGE.desktop : prevIndex - ITEMS_PER_PAGE.desktop,
        );
    };

    const nextUserSlide = () => {
        setUserPostsIndex((prevIndex) => (prevIndex + ITEMS_PER_PAGE.desktop >= userPosts.length ? 0 : prevIndex + ITEMS_PER_PAGE.desktop));
    };

    const prevUserSlide = () => {
        setUserPostsIndex((prevIndex) =>
            prevIndex - ITEMS_PER_PAGE.desktop < 0 ? userPosts.length - ITEMS_PER_PAGE.desktop : prevIndex - ITEMS_PER_PAGE.desktop,
        );
    };

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
        window.location.reload();
    };

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.touches[0].clientX);
    };

    const handleTouchEnd = (posts, currentIndex, setIndex) => {
        const minSwipeDistance = 50;
        const swipeDistance = touchStart - touchEnd;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            // Swipe left
            if (swipeDistance > 0) {
                setIndex((prevIndex) => 
                    prevIndex + 1 >= posts.length ? 0 : prevIndex + 1
                );
            }
            // Swipe right
            else {
                setIndex((prevIndex) => 
                    prevIndex - 1 < 0 ? posts.length - 1 : prevIndex - 1
                );
            }
        }
    };

    const PostList = ({ posts, currentIndex, onNext, onPrev, title }) => (
        <div className="w-full md:w-[1024px] mx-auto mt-4 md:mt-8 bg-white rounded-lg p-3 md:p-6 relative shadow-md border">
            <h3 className="font-semibold text-black-500 text-lg md:text-2xl pb-2">
                {title} ({posts.length})
            </h3>

            {posts.length > 0 ? (
                <div className="relative mt-2 md:mt-4">
                    {/* Navigation Buttons - Hide on mobile */}
                    <button
                        onClick={onPrev}
                        className="hidden md:block absolute left-[-30px] top-1/2 -translate-y-1/2 
                                 bg-amber-300 shadow-md p-2 rounded-full z-10 
                                 hover:bg-amber-400 transition-colors"
                    >
                        <IoIosArrowBack className="text-gray-600 text-2xl" />
                    </button>

                    <div className="overflow-hidden relative">
                        <motion.div
                            className="flex gap-2 md:gap-4 touch-pan-y"
                            animate={{ 
                                x: -currentIndex * (100 / (window.innerWidth < 768 
                                    ? ITEMS_PER_PAGE.mobile 
                                    : window.innerWidth < 1024 
                                        ? ITEMS_PER_PAGE.tablet 
                                        : ITEMS_PER_PAGE.desktop)) + '%' 
                            }}
                            transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={() => handleTouchEnd(posts, currentIndex, 
                                posts === userPosts ? setUserPostsIndex : setCurrentIndex)}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            dragMomentum={false}
                        >
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="min-w-full sm:min-w-[48%] md:min-w-[24%] bg-white rounded-lg 
                                             overflow-hidden cursor-pointer transition-all duration-300 
                                             hover:shadow-lg hover:scale-[1.02] hover:border"
                                    onClick={() => handlePostClick(post.id)}
                                >
                                    <img
                                        src={post?.images[0]?.url}
                                        alt={post?.title}
                                        className="w-full h-[140px] md:h-[160px] object-cover"
                                    />
                                    <div className="p-3 md:p-4">
                                        <h3 className="text-base md:text-xl font-semibold text-gray-800 mb-1 line-clamp-2">
                                            {post?.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-base md:text-xl">
                                            <p className="text-green-600 font-semibold">
                                                {post?.room?.price} triệu
                                            </p>
                                            <p className="text-green-600 font-semibold">
                                                {post?.room?.area}m²
                                            </p>
                                        </div>
                                        <div className="flex gap-1 items-center mt-2 text-gray-600 text-sm md:text-base">
                                            <FaLocationDot size={12} color="red" />
                                            <p className="line-clamp-1">{post?.room?.district}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <button
                        onClick={onNext}
                        className="hidden md:block absolute right-[-30px] top-1/2 -translate-y-1/2 
                                 bg-amber-300 shadow-md p-2 rounded-full z-10
                                 hover:bg-amber-400 transition-colors"
                    >
                        <IoIosArrowForward className="text-gray-600 text-2xl" />
                    </button>

                    {/* Mobile swipe indicator */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500 md:hidden">
                        <IoIosArrowBack size={16} />
                        <span>Vuốt để xem thêm</span>
                        <IoIosArrowForward size={16} />
                    </div>

                    {/* Mobile Pagination Indicators */}
                    <div className="flex justify-center gap-2 mt-4 md:hidden">
                        {Array.from({ length: Math.ceil(posts.length / ITEMS_PER_PAGE.mobile) }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    Math.floor(currentIndex / ITEMS_PER_PAGE.mobile) === index
                                        ? 'w-4 bg-amber-400'
                                        : 'w-2 bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-4 text-sm md:text-base">
                    Chưa có bài đăng nào...
                </p>
            )}
        </div>
    );

    return (
        <div className="px-4 md:px-0">
            <PostList 
                posts={posts} 
                currentIndex={currentIndex}
                onNext={nextSlide}
                onPrev={prevSlide}
                title="Tin đăng cùng khu vực"
            />
            
            {userPosts.length > 0 && (
                <PostList 
                    posts={userPosts}
                    currentIndex={userPostsIndex}
                    onNext={nextUserSlide}
                    onPrev={prevUserSlide}
                    title={`Tin đăng của ${userPosts[0]?.user?.first_name} ${userPosts[0]?.user?.last_name}`}
                />
            )}
        </div>
    );
};

export default AroundPost;
