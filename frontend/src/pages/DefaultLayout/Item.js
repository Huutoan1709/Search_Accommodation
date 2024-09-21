import React, { memo, useState, useEffect } from 'react';
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
const Item = ({ images, title, content, room, created_at, created_at_humanized, user, id }) => {
    const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: vi });
    const [HoverHearth, setHoverHearth] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkIfFavorited = async () => {
            try {
                const res = await authApi().get(endpoints['myfavorite']);
                const favoritePosts = res.data.map((favorite) => favorite.id);
                setFavorite(favoritePosts.includes(id));
            } catch (error) {
                console.error('Error fetching favorite posts:', error);
            }
        };
        checkIfFavorited();
    }, [id]);

    const handlePostClick = () => {
        navigate(`/post/${id}`);
    };

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();

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
        <div className="w-full flex border-t border-orange-700 p-3 gap-1 bg-white ">
            <div
                className="w-[42%] flex flex-wrap gap-[1px] items-center rounded-xl relative cursor-pointer"
                onClick={handlePostClick}
            >
                {images.slice(0, 4).map((image, index) => (
                    <img key={index} src={image.url} alt="image" className="w-[135px] h-[125px] object-cover" />
                ))}
                <span className="bg-overlay-30 rounded-md text-white px-2 absolute right-1 top-1">{`${images.length} ảnh`}</span>
                <span
                    className="absolute bottom-1 right-1 cursor-pointer"
                    onMouseEnter={() => setHoverHearth(true)}
                    onMouseLeave={() => setHoverHearth(false)}
                    onClick={handleFavoriteClick}
                >
                    {favorite ? (
                        <PiHeartStraightFill size={25} color="red" />
                    ) : HoverHearth ? (
                        <PiHeartStraightFill size={25} color="red" />
                    ) : (
                        <PiHeartStraightLight size={25} />
                    )}
                </span>
            </div>
            <div className="w-[60%] pl-2 text-[15px] gap-1 flex flex-col">
                <div className="items-center">
                    <h3 className="text-red-600 font-semibold cursor-pointer" onClick={handlePostClick}>
                        {title}
                    </h3>
                </div>
                <div className=" flex items-center gap-4">
                    <span className="flex font-semibold text-[16px]">
                        <MdOutlineAttachMoney size={20} className="text-gray-500" />
                        <p className="text-green-500">{room?.price} triệu/tháng</p>
                    </span>
                    <span className=" flex">
                        <BiArea size={20} className="text-gray-500" />
                        {room?.area}m2
                    </span>
                </div>
                <span className=" flex items-center">
                    <CiStopwatch size={20} className="text-gray-500" />
                    {timeAgo}
                </span>
                <span className=" flex items-center">
                    <PiMapPinAreaFill className="text-gray-500 mr-2" size={20} />
                    {`${room?.ward}, ${room?.district}, ${room?.city}`}
                </span>
                <p className="text-gray-500, min-h-[90px] text-[14px]">
                    {content.length > 170 ? `${content.slice(0, 170)}...` : content}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={Logomotel} alt="avatar" className="w-[30px] h-[30px] rounded-full object-cover" />
                        <p>
                            {user?.first_name} {user?.last_name}
                        </p>
                    </div>

                    <div className="flex items-center">
                        <button type="button" className="border border-red-300 rounded-md">
                            <div className="flex items-center p-1">{`Gọi ${user?.phone}`}</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Item);
