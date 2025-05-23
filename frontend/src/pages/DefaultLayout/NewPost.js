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
        return <div>Chưa có bài đăng nào gần đây</div>;
    }

    return posts.map((post) => {
        const handlePostClick = () => navigate(`/post/${post.id}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        return (
            <div
                key={post.id}
                className="w-full flex items-center gap-1 py-2 border-b border-gray-300 cursor-pointer bg-white hover:bg-gray-100 transition duration-200 ease-in-out"
                onClick={handlePostClick}
            >
                <img
                    src={post.images[0]?.url || 'default-image.jpg'}
                    alt="ảnh"
                    className="w-[65px] h-[65px] object-cover rounded-md"
                />
                <div className="w-full pl-2">
                    <h4 className="text-blue-500 text-[12px] mb-2">
                        {post?.title.length > 40 ? `${post?.title.slice(0, 40)}...` : post?.title}
                    </h4>
                    <div className="flex items-center justify-between">
                        <span className="text-green-500 font-medium text-[12px]">{post?.room?.price} triệu</span>
                        <div className="flex gap-1 items-center">
                            <CiStopwatch size={15} className="text-gray-500" />
                            <span className="text-[10px]">
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
