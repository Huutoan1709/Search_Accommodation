import React, { memo, useState } from 'react';
import '../../output.css';
import { PiHeartStraightFill } from 'react-icons/pi';
import { PiHeartStraightLight } from 'react-icons/pi';
import Logomotel from '../../assets/Logomotel.png';
import { SlUserFollow, SlUserFollowing } from 'react-icons/sl';
import { PiMapPinAreaFill } from 'react-icons/pi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { BiArea } from 'react-icons/bi';
const image = {};

const Item = () => {
    const [HoverHearth, setHoverHearth] = useState(false);
    return (
        <div className="w-full flex  border-t border-red-600 p-4 pt-5 rounded-xl mb-[15px] shadow-xl">
            <div className="w-[42%] flex flex-wrap gap-[2px] items-center rounded-xl relative cursor-pointer">
                <img src={Logomotel} alt="image" className="w-[140px] h-[120px] object-cover" />
                <img src={Logomotel} alt="image" className="w-[140px] h-[120px] object-cover" />
                <img src={Logomotel} alt="image" className="w-[140px] h-[120px] object-cover" />
                <img src={Logomotel} alt="image" className="w-[140px] h-[120px] object-cover" />
                <span className="bg-overlay-30 rounded-md text-white px-2 absolute right-1 top-1">4 ảnh</span>
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
                    <h3 className="text-red-600 font-semibold">
                        CHO THUÊ PHÒNG TRỌ CAO CẤP QUẬN THỦ ĐỨC THÀNH PHỐ HỒ CHÍ MINH
                    </h3>
                </div>
                <div className="my-2 flex items-center">
                    <span className="flex font-bold text-blue-600 mx-2">
                        <MdOutlineAttachMoney size={20} />
                        3.7 triệu/tháng
                    </span>
                    <span className=" flex font-bold text-blue-600 ml-4">
                        <BiArea size={20} />
                        22m2
                    </span>
                </div>
                <span className="flex items-center my-2">
                    <PiMapPinAreaFill className="text-blue-700 mx-1" size={20} />
                    Quận Tân Bình, TP.Hồ Chí Minh
                </span>
                <p className="text-gray-600 my-2, min-h-[120px]">
                    CĂN HỘ CAO CẤP THÀNH PHỐ THỦ ĐỨC , CÓ HỒ BƠI PHÒNG GYM VÀ NHIỀU TIỆN ÍCH
                </p>
                <div className="flex items-center mt-5 justify-between">
                    <div className="flex items-center">
                        <img src={Logomotel} alt="avatar" className="w-[30px] h-[30px] rounded-full object-cover" />
                        <p>Hữu Toàn</p>
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
                            <div className="flex items-center p-1">Gọi 0961499xxx</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default memo(Item);
