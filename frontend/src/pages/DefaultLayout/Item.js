import React, { memo, useState, useEffect, useContext } from 'react';
import '../../output.css';
import Logomotel from '../../assets/Logomotel.png';
import { useNavigate } from 'react-router-dom';
import { PiHeartStraightFill, PiHeartStraightLight, PiListStarThin, PiStarThin } from 'react-icons/pi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { BiArea } from 'react-icons/bi';
import { PiMapPinAreaFill } from 'react-icons/pi';
import API, { authApi, endpoints } from '../../API';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CiStopwatch } from 'react-icons/ci';
import { notifySuccess, notifyWarning } from '../../components/ToastManager';
import MyContext from '../../context/MyContext';
import { AiFillSafetyCertificate } from 'react-icons/ai';

const Item = ({ images, title, content, room, created_at, user, id, post_type }) => {
    const { user: loggedInUser } = useContext(MyContext);
    const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: vi });
    const [HoverHearth, setHoverHearth] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkIfFavorited = async () => {
            try {
                if (!loggedInUser) return;

                const res = await authApi().get(endpoints['myfavorite']);
                const favoritePosts = res.data.map((favorite) => favorite.id);
                setFavorite(favoritePosts.includes(id));
            } catch (error) {
                console.error('Error fetching favorite posts:', error);
            }
        };

        checkIfFavorited();
    }, [id, loggedInUser]);

    const handlePostClick = () => {
        navigate(`/post/${id}`);
    };

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();

        if (!loggedInUser) {
            notifyWarning('Đăng nhập để thêm bài viết yêu thích');
            return;
        }

        try {
            const res = await authApi().post(endpoints.createFavorite, { post_id: id });
            if (res.data.message === 'Post removed from favorites') {
                setFavorite(false);
                notifyWarning('Bỏ yêu thích thành công');
            } else if (res.data.message === 'Post added to favorites') {
                setFavorite(true);
                notifySuccess('Đã thêm vào yêu thích');
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    };

    return (
        <div className={`
            relative flex w-full p-6 gap-6 bg-white rounded-xl 
            transition-all duration-300 ease-in-out
            ${post_type?.name === 'VIP' 
                ? 'border-2 border-amber-500 hover:shadow-lg hover:shadow-amber-100' 
                : 'border border-gray-200 hover:shadow-md'
            }
        `}>
            {/* VIP Badge */}
            {post_type?.name === 'VIP' && (
                <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xl font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                        <PiListStarThin className="mr-2"  size={20}/>
                        VIP
                    </span>
                </div>
            )}

            {/* Image Section */}
            <div
                className="w-[42%] relative rounded-lg overflow-hidden cursor-pointer group"
                onClick={handlePostClick}
            >
                <div className="grid grid-cols-2 gap-1">
                    {images.slice(0, 4).map((image, index) => (
                        <img 
                            key={index} 
                            src={image.url} 
                            alt="image" 
                            className="w-full h-[125px] object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                    ))}
                </div>
                
                 <span className="absolute top-2 right-4 bg-black/60 backdrop-blur-sm text-white text-lg px-3 py-1 rounded-full">
                    {images.length} ảnh
                </span>

                {/* Favorite button */}
                <button
                    className="absolute bottom-2 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm 
                             hover:bg-white transition-all duration-300 "
                    onMouseEnter={() => setHoverHearth(true)}
                    onMouseLeave={() => setHoverHearth(false)}
                    onClick={handleFavoriteClick}
                >
                    {favorite ? (
                        <PiHeartStraightFill size={24} className="text-red-500" />
                    ) : HoverHearth ? (
                        <PiHeartStraightFill size={24} className="text-red-500" />
                    ) : (
                        <PiHeartStraightLight size={24} className="text-gray-600" />
                    )}
                </button>
            </div>

            {/* Content Section */}
            <div className="w-[60%] pl-4 flex flex-col justify-between">
                {/* Title */}
                <div className="items-center">
                    <h3 
                        className={`text-xl font-semibold mb-4 cursor-pointer hover:text-amber-600 transition-colors
                            ${post_type?.name === 'VIP' ? 'text-amber-800' : 'text-gray-800'}`} 
                        onClick={handlePostClick}
                    >
                        {title.length > 70 ? `${title.slice(0, 70)}...` : title}
                    </h3>
                </div>

                {/* Price and Area Section */}
                <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                        <MdOutlineAttachMoney size={24} className="text-amber-500" />
                        <span className="text-2xl font-bold text-green-600">
                            {room?.price} triệu/tháng
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BiArea size={22} className="text-amber-500" />
                        <span className="text-lg text-gray-700">
                            {room?.area}m²
                        </span>
                    </div>
                </div>

                {/* Location and Time Info */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <PiMapPinAreaFill className="text-amber-500" size={20} />
                        <span className="text-lg">{`${room?.district}, ${room?.city}`}</span>
                    </div>

                    <div className={`flex items-center gap-3 text-lg
                        ${post_type?.name === 'VIP' ? 'text-amber-700' : 'text-gray-600'}`}>
                        <span className="flex items-center gap-2">
                            <CiStopwatch className="text-amber-500" size={20} />
                            {timeAgo}
                        </span>
                        {post_type?.name === 'VIP' && (
                            <span className="flex items-center gap-2 text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
                                <AiFillSafetyCertificate className="text-amber-500" />
                                Tin ưu tiên
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3">
                    {content.length > 150 ? (
                        <div dangerouslySetInnerHTML={{ __html: `${content.slice(0, 150)}...` }}></div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: content }}></div>
                    )}
                </div>

                {/* Footer - User Info and Contact */}
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img 
                                src={user?.avatar} 
                                alt="avatar" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-amber-500" 
                            />
    
                            
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                                {user?.first_name} {user?.last_name}
                            </span>
                            {user?.reputation && (
                                <span className="text-base text-green-600 flex items-center gap-1">

                                    Người đăng tin uy tín
                                     <AiFillSafetyCertificate size={16} />
                                     </span>
                            )}
                        </div>
                    </div>

                    <button 
                        type="button" 
                        className="px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600
                                 transition-all duration-300 flex items-center gap-2 font-medium shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <span>{user?.phone}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(Item);
