import React, { useEffect, useState } from 'react';
import Header from '../../DefaultLayout/Header';
import { authApi, endpoints } from '../../../API';
import Logomotel from '../../../assets/Logomotel.png';
import { useNavigate } from 'react-router-dom';
import { PiHeartStraightFill, PiHeartStraightLight } from 'react-icons/pi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { BiArea } from 'react-icons/bi';
import { PiMapPinAreaFill } from 'react-icons/pi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CiStopwatch } from 'react-icons/ci';
import Footer from '../../DefaultLayout/footer';
import NewPost from '../../DefaultLayout/NewPost';
import { notifySuccess } from '../../../components/ToastManager';

const PostItem = ({ post }) => {
    const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: vi });
    const [HoverHearth, setHoverHearth] = useState(false);
    const [favorite, setFavorite] = useState(post.is_active);
    const navigate = useNavigate();

    const handlePostClick = () => {
        navigate(`/post/${post.id}`);
    };

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        try {
            const res = await authApi().post(endpoints.createFavorite, { post_id: post.id });
            if (res.data.message === 'Post removed from favorites') {
                notifySuccess('Đã xóa tin khỏi danh sách yêu thích');
                setFavorite(false);
                window.location.reload();
            } else if (res.data.message === 'Post added to favorites') {
                setFavorite(true);
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    };

    return (
        <div key={post.id} className="w-full flex border-t border-orange-600 p-3 gap-1 bg-white ">
            <div
                className="w-[42%] flex flex-wrap gap-[1px] items-center rounded-lg relative cursor-pointer pl-4"
                onClick={handlePostClick}
            >
                {post.images.slice(0, 4).map((image, index) => (
                    <img
                        key={index}
                        src={image.url || Logomotel}
                        alt="image"
                        className="w-[135px] h-[125px] object-cover"
                    />
                ))}
                <span className="bg-overlay-30 rounded-md text-white px-2 absolute right-1 top-1 mr-1">{`${post.images.length} ảnh`}</span>
                <span
                    className="absolute bottom-1 right-1 cursor-pointer mr-[2px]"
                    onMouseEnter={() => setHoverHearth(true)}
                    onMouseLeave={() => setHoverHearth(false)}
                    onClick={handleFavoriteClick}
                >
                    {favorite ? (
                        <PiHeartStraightFill size={27} color="red" />
                    ) : HoverHearth ? (
                        <PiHeartStraightFill size={27} color="red" />
                    ) : (
                        <PiHeartStraightLight size={27} className="text-white font-semibold" />
                    )}
                </span>
            </div>
            <div className="w-[60%] pl-2 text-2xl gap-1 flex flex-col">
                <div className="items-center">
                    <h3 className=" font-semibold cursor-pointer" onClick={handlePostClick}>
                        {post.title.length > 70 ? `${post.title.slice(0, 70)}...` : post.title}
                    </h3>
                </div>
                <div className=" flex items-center gap-4">
                    <span className="flex font-semibold text-2xl">
                        <MdOutlineAttachMoney size={20} className="text-gray-400" />
                        <p className="text-green-500">{post.room?.price} triệu/tháng</p>
                    </span>
                    <span className=" flex">
                        <BiArea size={20} className="text-gray-400" />
                        {post.room?.area}m²
                    </span>
                </div>
                <span className=" flex items-center">
                    <CiStopwatch size={18} className="text-gray-500" />
                    {timeAgo}
                </span>
                <span className=" flex items-center">
                    <PiMapPinAreaFill className="text-gray-400 mr-2" size={18} />
                    {`${post?.room?.district}, ${post?.room?.city}`}
                </span>
                <div className="text-gray-400 min-h-[100px] text-[13px]">
                    {post?.content.length > 150 ? (
                        <div dangerouslySetInnerHTML={{ __html: `${post?.content.slice(0, 150)}...` }}></div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: post?.content }}></div>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src={post.user?.avatar || Logomotel}
                            alt="avatar"
                            className="w-[30px] h-[30px] rounded-full object-cover"
                        />
                        <p className="flex items-center justify-center gap-1">
                            {post.user?.first_name} {post.user?.last_name}
                        </p>
                    </div>

                    <div className="flex items-center">
                        <button type="button" className="border border-gray-400 rounded-md">
                            <div className="flex items-center p-1">{`Gọi ${post.user?.phone}`}</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FavoritePost = () => {
    const [favoritePosts, setFavoritePosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await authApi().get(endpoints['myfavorite']);
                setFavoritePosts(res.data);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu tin đã lưu:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <Header />
            <div className="w-[1024px] m-auto">
                <div>
                    <h1 className="mt-4 mb-0 text-[24px] font-bold">Tin đã lưu</h1>
                </div>
                <div className="flex w-full gap-4">
                    <div className="w-[70%]">
                        {favoritePosts.length > 0 ? (
                            favoritePosts.map((post) => <PostItem key={post.id} post={post} />)
                        ) : (
                            <p>Không có tin nào đã lưu.</p>
                        )}
                    </div>
                    <div className="w-[30%] flex flex-col gap-4 justify-start items-center">
                        <div className="w-full bg-white p-4 shadow-lg rounded-md">
                            <h3 className="font-bold">Hỗ trợ tiện ích</h3>
                            <ul className="mt-2 space-y-2">
                                <li>Tư vấn phong thủy</li>
                                <li>Dự tính chi phí làm nhà</li>
                                <li>Tính lãi suất</li>
                                <li>Quy trình xây nhà</li>
                                <li>Xem tuổi làm nhà</li>
                            </ul>
                        </div>
                        <div className="w-full bg-[#fff] mb-5 rounded-xl border border-gray-300 border-b-2 p-5 shadow-xl">
                            <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">
                                Tin mới đăng
                            </h3>
                            <NewPost />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default FavoritePost;
