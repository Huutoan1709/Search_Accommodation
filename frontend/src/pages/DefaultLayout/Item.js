import React, { memo, useState } from 'react';
import '../../output.css';
import Logomotel from '../../assets/Logomotel.png';
import { useNavigate } from 'react-router-dom';
import { PiHeartStraightFill, PiHeartStraightLight } from 'react-icons/pi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { BiArea } from 'react-icons/bi';
import { SlUserFollow } from 'react-icons/sl';
import { PiMapPinAreaFill } from 'react-icons/pi';

const Item = ({ images, title, content, room, created_at, user, id }) => {
    const [HoverHearth, setHoverHearth] = useState(false);
    const navigate = useNavigate();
    const handlePostClick = () => {
        navigate(`/post/${id}`);
    };
    return (
        <div className="w-full flex  border-t border-orange-700 p-5 gap-1 bg-white " onClick={handlePostClick}>
            <div className="w-[42%] flex flex-wrap gap-[1px] items-center rounded-xl relative cursor-pointer">
                {images.slice(0, 4).map((image, index) => (
                    <img key={index} src={image.url} alt="image" className="w-[135px] h-[120px] object-cover" />
                ))}
                <span className="bg-overlay-30 rounded-md text-white px-2 absolute right-1 top-1">{`${images.length} ảnh`}</span>
                <span
                    className="absolute bottom-1 right-1 "
                    onMouseEnter={() => setHoverHearth(true)}
                    onMouseLeave={() => setHoverHearth(false)}
                >
                    {HoverHearth ? <PiHeartStraightFill size={25} color="red" /> : <PiHeartStraightLight size={25} />}
                </span>
            </div>
            <div className="w-[60%] pl-2">
                <div className="items-center">
                    <h3 className="text-red-600 font-semibold cursor-pointer">{title}</h3>
                </div>
                <div className="my-2 flex items-center">
                    <span className="flex font-bold mr-2">
                        <MdOutlineAttachMoney size={20} className="text-gray-500" />
                        <p className="text-green-500">{room?.price} triệu/tháng</p>
                    </span>
                    <span className=" flex ml-4">
                        <BiArea size={20} className="text-gray-500" />
                        {room?.area}m2
                    </span>
                </div>
                <span className="flex items-center my-2">
                    <PiMapPinAreaFill className="text-gray-500 mr-2" size={20} />
                    {`${room?.district}, ${room?.city}`}
                </span>
                <p className="text-gray-600 my-2, min-h-[120px]">
                    {content.length > 170 ? `${content.slice(0, 170)}...` : content}
                </p>
                <div className="flex items-center mt-5 justify-between">
                    <div className="flex items-center">
                        <img src={Logomotel} alt="avatar" className="w-[30px] h-[30px] rounded-full object-cover" />
                        <p>
                            {user?.first_name} {user?.last_name}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <button type="button" className=" border border-red-300 rounded-md pr-3">
                            <div className="flex items-center p-1">
                                Theo Dõi <SlUserFollow className="ml-2" />
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center">
                        <button type="button" className=" border border-red-300  rounded-md pr-3">
                            <div className="flex items-center p-1">{`Gọi ${user?.phone}`}</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default memo(Item);
