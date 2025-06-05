import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, endpoints } from '../API';
import { MdNavigateNext } from 'react-icons/md';
import { FaLocationDot } from 'react-icons/fa6';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import MyContext from '../context/MyContext';
import { motion } from 'framer-motion';
import { PiHeartStraightFill, PiHeartStraightLight } from 'react-icons/pi';
import { notifySuccess, notifyWarning } from './ToastManager';

const ITEMS_PER_PAGE = 4;

const RecommendedRooms = () => {
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [favorites, setFavorites] = useState({});
    const [hoverHearts, setHoverHearts] = useState({}); 
    const navigate = useNavigate();
    const { user } = useContext(MyContext);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user) return;

            try {
                const response = await authApi().get(endpoints['recommendedrooms']);
                setRecommendedPosts(response.data);
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user]);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;
            try {
                const res = await authApi().get(endpoints['myfavorite']);
                const favoriteMap = {};
                res.data.forEach(post => {
                    favoriteMap[post.id] = true;
                });
                setFavorites(favoriteMap);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, [user]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            (prevIndex + ITEMS_PER_PAGE >= recommendedPosts.length ? 0 : prevIndex + ITEMS_PER_PAGE)
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex - ITEMS_PER_PAGE < 0 ? 
            recommendedPosts.length - ITEMS_PER_PAGE : 
            prevIndex - ITEMS_PER_PAGE
        );
    };

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    const handleFavoriteClick = async (e, postId) => {
        e.stopPropagation();
        
        try {
            const res = await authApi().post(endpoints.createFavorite, { 
                post_id: postId 
            });

            if (res.data.message === 'Post removed from favorites') {
                setFavorites(prev => ({
                    ...prev,
                    [postId]: false
                }));
                notifySuccess('Bỏ yêu thích thành công');
            } else if (res.data.message === 'Post added to favorites') {
                setFavorites(prev => ({
                    ...prev,
                    [postId]: true
                }));
                notifySuccess('Đã thêm vào yêu thích');
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    };

    // If no user or no recommendations, don't render anything
    if (!user || recommendedPosts.length === 0) {
        return null;
    }

    if (loading) {
        return (
            <div className="w-[1024px] m-auto mt-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="flex gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-1/4 h-[300px] bg-white/80 rounded-lg shadow"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-[1024px] m-auto mt-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 relative shadow-md">
            <h3 className="font-semibold text-slate-800 text-2xl pb-2 flex items-center gap-2">
                <MdNavigateNext className="text-amber-500" size={28}/>
                <span>Dành cho bạn</span>
                <span className="text-amber-500">({recommendedPosts.length})</span>
            </h3>

            <div className="relative mt-4">
                <button
                    onClick={prevSlide}
                    className="absolute left-[-30px] top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 rounded-full z-10 hover:bg-amber-50 transition-colors"
                >
                    <IoIosArrowBack className="text-amber-500 text-2xl" />
                </button>

                <div className="overflow-hidden relative">
                    <motion.div
                        className="flex gap-4"
                        animate={{ x: -currentIndex * (100 / ITEMS_PER_PAGE) + '%' }}
                        transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                    >
                        {recommendedPosts.map((post) => (
                            <div
                                key={post.id}
                                className="min-w-[24%] bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative"
                                onClick={() => handlePostClick(post.id)}
                            >
                                <div className="relative">
                                    <img
                                        src={post.images && post.images.length > 0 ? post.images[0].url : 'default-image.jpg'}
                                        alt={post.title}
                                        className="w-full h-[160px] object-cover group-hover:brightness-105 transition-all"
                                        
                                    />
                                    <button
                                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm 
                                                hover:bg-white transition-all duration-300"
                                        onClick={(e) => handleFavoriteClick(e, post.id)}
                                        onMouseEnter={() => setHoverHearts(prev => ({...prev, [post.id]: true}))}
                                        onMouseLeave={() => setHoverHearts(prev => ({...prev, [post.id]: false}))}
                                    >
                                        {favorites[post.id] ? (
                                            <PiHeartStraightFill size={20} className="text-red-500" />
                                        ) : hoverHearts[post.id] ? (
                                            <PiHeartStraightFill size={20} className="text-red-500" />
                                        ) : (
                                            <PiHeartStraightLight size={20} className="text-gray-600" />
                                        )}
                                    </button>
                                    {post.room?.is_verified && (
                                        <span className="absolute top-2 left-2 bg-blue-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                            Đã xác thực
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 bg-gradient-to-b from-white to-slate-50">
                                    <h3 className="text-xl font-semibold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">
                                        {post.title?.length > 50 ? `${post.title.slice(0, 47)}...` : post.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xl">
                                        <p className="text-green-600 font-semibold">{post.room?.price} triệu</p>
                                        <span className="text-slate-300">•</span>
                                        <p className="text-green-600 font-semibold">{post.room?.area}m²</p>
                                    </div>
                                    <div className="flex gap-1 items-center mt-2 text-slate-600">
                                        <FaLocationDot size={12} className="text-amber-500" />
                                        <p>{post.room?.district}</p>
                                    </div>
                                   
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <button
                    onClick={nextSlide}
                    className="absolute right-[-30px] top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 rounded-full z-10 hover:bg-amber-50 transition-colors"
                >
                    <IoIosArrowForward className="text-amber-500 text-2xl" />
                </button>
            </div>
        </div>
    );
};

export default RecommendedRooms;