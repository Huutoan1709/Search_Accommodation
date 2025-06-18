import React, { useEffect, useState } from 'react';
import API, { endpoints } from '../../API';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { CiStopwatch } from 'react-icons/ci';

const NewPost = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                let res = await API.get(endpoints['post']);
                let sortedPosts = res.data.results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sắp xếp bài đăng theo thời gian mới nhất

                setPosts(sortedPosts.slice(0, 20)); // Lấy tối đa 20 bài đăng
            } catch (err) {
                console.error(err);
            }
        };
        fetchPosts();
    }, []);

    if (!posts.length) {
        return (
            <div className="text-center text-gray-500 text-sm md:text-base p-4">
                Chưa có bài đăng nào gần đây
            </div>
        );
    }

    return posts.map((post) => {
        const handlePostClick = () => navigate(`/post/${post.id}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        return (
            <div
                key={post.id}
                className="w-full flex items-center gap-2 md:gap-3 p-2 md:py-3 border-b border-gray-300 
                         cursor-pointer bg-white hover:bg-gray-100 transition duration-200 ease-in-out"
                onClick={handlePostClick}
            >
                {/* Image - Responsive size */}
                <img
                    src={post.images[0]?.url || 'default-image.jpg'}
                    alt="ảnh"
                    className="w-[60px] h-[60px] md:w-[70px] md:h-[70px] object-cover rounded-md"
                />

                {/* Content Container */}
                <div className="flex-1 pl-1 md:pl-2">
                    {/* Title - Responsive text size and better truncation */}
                    <h4 className="text-blue-500 text-[11px] md:text-[13px] font-medium mb-1 md:mb-2 line-clamp-2">
                        {post?.title}
                    </h4>

                    {/* Price and Time - Improved layout */}
                    <div className="flex items-center justify-between">
                        {/* Price */}
                        <span className="text-green-500 font-medium text-[11px] md:text-[13px]">
                            {post?.room?.price} triệu
                        </span>

                        {/* Time */}
                        <div className="flex items-center gap-1 md:gap-1.5">
                            <CiStopwatch className="text-gray-500 w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-[9px] md:text-[11px] text-gray-500">
                                {formatDistanceToNow(parseISO(post?.created_at), {
                                    addSuffix: true,
                                    locale: vi,
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    });
};

export default NewPost;
