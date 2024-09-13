import React, { memo } from 'react';
import '../../output.css';
import { PiHeartStraightFill } from 'react-icons/pi';
import { PiHeartStraightLight } from 'react-icons/pi';
import Logomotel from '../../assets/Logomotel.png';
import { SlUserFollow, SlUserFollowing } from 'react-icons/sl';

const image = {};

const Item = () => {
    return (
        <div className="w-full flex  border-t border-red-600 p-4 pt-5 rounded-xl">
            <div className="w-[42%] flex flex-wrap gap-[2px] items-center rounded-xl relative">
                <img src={Logomotel} alt="image" className="w-[140px] h-[120px] object-cover" />
                <img src={Logomotel} alt="image" className="w-[140px] h-[120px] object-cover" />
                <img src={Logomotel} alt="image" className="w-[140px] h-[120px] object-cover" />
                <img src={Logomotel} alt="image" className="w-[140px] h-[120px] object-cover" />
                <span className="bg-gray-700 rounded-md text-white px-2 absolute right-1 bottom-1">4 ảnh</span>
            </div>
            <div className="w-3/5 pl-3">
                <div className="items-center">
                    <h3 className="text-red-600 font-semibold">
                        CHO THUÊ PHÒNG TRỌ CAO CẤP QUẬN THỦ ĐỨC THÀNH PHỐ HỒ CHÍ MINH
                    </h3>
                </div>
                <div className="my-2 flex items-center justify-around">
                    <span className="font-bold text-blue-600">3.7 triệu/tháng</span>
                    <span className="font-bold text-blue-600">22m2</span>
                    <span>Quận Tân Bình, TP.Hồ Chí Minh</span>
                </div>
                <p className="text-fray-600 my-2, min-h-[120px]">
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
