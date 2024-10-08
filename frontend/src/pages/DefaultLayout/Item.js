import React, { memo, useState, useEffect, useContext } from 'react';
import '../../output.css';
import Logomotel from '../../assets/Logomotel.png';
import { useNavigate } from 'react-router-dom';
import { PiHeartStraightFill, PiHeartStraightLight } from 'react-icons/pi';
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

const Item = ({ images, title, content, room, created_at, user, id }) => {
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
        <div className="w-full flex border-t border-orange-600 p-3 gap-1 bg-white ">
            <div
                className="w-[42%] flex flex-wrap gap-[1px] items-center rounded-xl relative cursor-pointer"
                onClick={handlePostClick}
            >
                {images.slice(0, 4).map((image, index) => (
                    <img key={index} src={image.url} alt="image" className="w-[135px] h-[125px] object-cover" />
                ))}
                <span className="bg-overlay-30 rounded-md text-white px-2 absolute right-1 top-1 mr-1">{`${images.length} ảnh`}</span>
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
                        {title.length > 70 ? `${title.slice(0, 70)}...` : title}
                    </h3>
                </div>
                <div className=" flex items-center gap-4">
                    <span className="flex font-semibold text-2xl">
                        <MdOutlineAttachMoney size={20} className="text-gray-400" />
                        <p className="text-green-500">{room?.price} triệu/tháng</p>
                    </span>
                    <span className=" flex">
                        <BiArea size={20} className="text-gray-400" />
                        {room?.area}m2
                    </span>
                </div>
                <span className=" flex items-center">
                    <CiStopwatch size={18} className="text-gray-500" />
                    {timeAgo}
                </span>
                <span className=" flex items-center">
                    <PiMapPinAreaFill className="text-gray-400 mr-2" size={18} />
                    {`${room?.district}, ${room?.city}`}
                </span>
                <div className="text-gray-400 min-h-[100px] text-[13px]">
                    {content.length > 150 ? (
                        <div dangerouslySetInnerHTML={{ __html: `${content.slice(0, 150)}...` }}></div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: content }}></div>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={user?.avatar} alt="avatar" className="w-[30px] h-[30px] rounded-full object-cover" />
                        <p className="flex items-center justify-center gap-1">
                            {user?.first_name} {user?.last_name}
                            {user?.reputation && (
                                <div
                                    className="relative items-center"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <span className="text-green-500">
                                        <AiFillSafetyCertificate size={18} />
                                    </span>
                                    {showTooltip && (
                                        <div className="w-20 absolute bg-gray-800 text-white text-xs rounded-md p-1 left-1/2 transform -translate-x-1/2 -translate-y-full mb-3">
                                            Uy tín
                                        </div>
                                    )}
                                </div>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center">
                        <button type="button" className="border border-gray-400 rounded-md">
                            <div className="flex items-center p-1">{`Gọi ${user?.phone}`}</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Item);
