import React, { useEffect, useState } from 'react';
import API, { endpoints } from '../../API';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NewPost = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                let res = await API.get(endpoints['post']);
                let sortedPosts = res.data.results
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .filter((post) => {
                        let differenceInHours = (new Date() - new Date(post.created_at)) / (1000 * 60 * 60);
                        return differenceInHours <= 72;
                    });

                setPosts(sortedPosts.slice(0, 10));
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

        return (
            <div
                key={post.id}
                className="w-full flex items-center gap-1 py-2 border-b border-gray-300 cursor-pointer"
                onClick={handlePostClick}
            >
                <img
                    src={post.images[0]?.url || 'default-image.jpg'}
                    alt="ảnh"
                    className="w-[65px] h-[65px] object-cover rounded-md"
                />
                <div className="w-full pl-2">
                    <h4 className="text-blue-500 text-[14px] mb-2">
                        {post?.title.length > 40 ? `${post?.title.slice(0, 40)}...` : post?.title}
                    </h4>
                    <div className="flex items-center justify-between">
                        <span className="text-green-500 font-medium text-[12x]">{post?.room?.price} triệu</span>
                        <span className="text-[10px]">
                            {formatDistanceToNow(parseISO(post?.created_at), {
                                addSuffix: true,
                                locale: vi,
                            })}
                        </span>
                    </div>
                </div>
            </div>
        );
    });
};

export default NewPost;
