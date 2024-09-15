import React, { useEffect, useState } from 'react';
import API, { endpoints } from '../../../API';
import { useParams } from 'react-router-dom';
import Header from '../../DefaultLayout/Header';
import SliderCustom from '../../DefaultLayout/Slider';
import { PiMapPinAreaFill } from 'react-icons/pi';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { BiArea } from 'react-icons/bi';
import { CiStopwatch } from 'react-icons/ci';
import { CiHashtag } from 'react-icons/ci';
import { BiBed, BiRuler, BiMoney } from 'react-icons/bi'; // thêm icon cho đẹp
import { MdOutlineGavel } from 'react-icons/md'; // icon pháp lý
import { RiFridgeLine } from 'react-icons/ri';
import { FaCouch, FaSnowflake, FaTv } from 'react-icons/fa'; // ví dụ các icon
import { GiWashingMachine } from 'react-icons/gi'; // máy giặt, tủ lạnh

function DetailPost() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchPost = async () => {
            try {
                let res = await API.get(endpoints['postdetail'](postId));
                setPost(res.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchPost();
    }, [postId]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!post) {
        return <div>Loading...</div>;
    }

    const features = [
        { label: 'Diện tích', value: `${post?.room?.area} m²`, icon: <BiRuler size={20} /> },
        { label: 'Loại phòng', value: post?.room?.room_type?.name, icon: <BiBed size={20} /> },
        { label: 'Pháp lý', value: 'Sổ đỏ/Sổ hồng', icon: <MdOutlineGavel size={20} /> },
        { label: 'Khu vực', value: `${post?.room?.city}`, icon: <PiMapPinAreaFill size={20} /> },
        { label: 'Mức giá', value: `${post?.room?.price} triệu/tháng`, icon: <BiMoney size={20} /> },
        { label: 'Mã tin', value: post?.id, icon: <CiHashtag size={20} /> },
    ];
    const getAmenityIcon = (name) => {
        const lowercasedName = name.toLowerCase(); // Chuyển tên về chữ thường để dễ kiểm tra

        switch (lowercasedName) {
            case 'tủ lạnh':
                return <RiFridgeLine size={20} />;
            case 'máy lạnh':
                return <FaSnowflake size={20} />;
            case 'máy giặt':
                return <GiWashingMachine size={20} />;
            case 'tivi':
                return <FaTv size={20} />;
            default:
                return <FaCouch size={20} />;
        }
    };
    const amenities = post?.room?.amenities?.map((amenity) => ({
        label: amenity.name,
        value: '',
        icon: getAmenityIcon(amenity.name),
    }));

    const prices = post?.room?.prices?.map((price) => ({
        label: price.name,
        value: `${price.value} VNĐ/tháng`,
        icon: <BiMoney size={20} />,
    }));

    const PostDetails = ({ post, features, amenities, prices }) => {};
    return (
        <div>
            <Header />
            <div className="w-[1024px] flex m-auto">
                <div className="w-full flex gap-4">
                    <div className="w-[70%]">
                        <SliderCustom images={post?.images} />
                        <div className="rounded-md shadow-md bg-white p-4">
                            <div>
                                <h2 className="text-[25px] font-bold text-red-600 ">{post?.title}</h2>
                            </div>
                            <div>
                                <span className="flex items-center gap-2 my-3">
                                    <PiMapPinAreaFill className="text-blue-700 mx-1" size={20} />
                                    <span className="text-[18px] ">
                                        {post?.room.ward} , {post?.room.district} , {post?.room.city}{' '}
                                    </span>
                                </span>
                            </div>
                            <div className=" h-[40px] flex items-center justify-between mt-4 border border-t-gray-350 border-b-gray-350 pr-2">
                                <span className="flex items-center gap-1">
                                    <MdOutlineAttachMoney size={20} className="text-gray-500 text-blue-500" />
                                    <span className="font-semibold text-[20px] text-blue-500">
                                        {post?.room?.price} triệu/tháng
                                    </span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <BiArea size={20} className="text-gray-500" />
                                    <span>{post?.room?.area}m2</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    {' '}
                                    <CiStopwatch />
                                    <span>
                                        {formatDistanceToNow(parseISO(post?.created_at), {
                                            addSuffix: true,
                                            locale: vi,
                                        })}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <CiHashtag />
                                    <span>{post?.id}</span>
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="font-semibold text-[20px] my-5">Thông tin mô tả: </h3>
                                <div className="gap-3 flex flex-col">{post?.content}</div>
                            </div>
                            <div className="mt-8">
                                <h3 className="font-semibold text-[20px] my-5">Đặc điểm tin đăng:</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center justify-between border-b py-2">
                                            <div className="flex items-center gap-2">
                                                {feature.icon}
                                                <span className="font-semibold">{feature.label}</span>
                                            </div>
                                            <span>{feature.value}</span>
                                        </div>
                                    ))}
                                </div>
                                {amenities.length > 0 && (
                                    <>
                                        <h3 className="font-semibold text-[20px] my-5">Nội thất:</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {amenities.map((amenity, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between border-b py-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {amenity.icon}
                                                        <span className="font-semibold">{amenity.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {prices.length > 0 && (
                                    <>
                                        <h3 className="font-semibold text-[20px] my-5">Giá dịch vụ:</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {prices.map((price, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between border-b py-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {price.icon}
                                                        <span className="font-semibold">{price.label}</span>
                                                    </div>
                                                    <span>{price.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <h3 className="font-semibold text-[20px] my-5">Bản Đồ:</h3>
                            </div>
                        </div>
                    </div>
                    <div className="w-[30%]">sidebar</div>
                </div>
            </div>
        </div>
    );
}

export default DetailPost;
