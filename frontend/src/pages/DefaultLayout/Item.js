import React, { memo, useState } from 'react';
import '../../output.css';
import { PiHeartStraightFill } from 'react-icons/pi';
import { PiHeartStraightLight } from 'react-icons/pi';
import Logomotel from '../../assets/Logomotel.png';
import { SlUserFollow, SlUserFollowing } from 'react-icons/sl';
import { PiMapPinAreaFill } from 'react-icons/pi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { BiArea } from 'react-icons/bi';

const Item = ({ images, title, content, room, created_at, user }) => {
    const [HoverHearth, setHoverHearth] = useState(false);
    return (
        <div className="w-full flex  border-t border-red-600 p-4 pt-5 rounded-xl mb-[15px] shadow-xl">
            <div className="w-[42%] flex flex-wrap gap-[2px] items-center rounded-xl relative cursor-pointer">
                {images.slice(0, 4).map((image, index) => (
                    <img key={index} src={image.url} alt="image" className="w-[140px] h-[120px] object-cover" />
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
            <div className="w-3/5 pl-3">
                <div className="items-center">
                    <h3 className="text-red-600 font-semibold">{title}</h3>
                </div>
                <div className="my-2 flex items-center">
                    <span className="flex font-bold text-blue-600 mx-2">
                        <MdOutlineAttachMoney size={20} />
                        {room?.price} triệu/tháng
                    </span>
                    <span className=" flex font-bold text-blue-600 ml-4">
                        <BiArea size={20} />
                        {room?.area}m2
                    </span>
                </div>
                <span className="flex items-center my-2">
                    <PiMapPinAreaFill className="text-blue-700 mx-1" size={20} />
                    {`${room?.ward}, ${room?.district}, ${room?.city}`}
                </span>
                <p className="text-gray-600 my-2, min-h-[120px]">
                    {content.length > 200 ? `${content.slice(0, 200)}...` : content}
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
