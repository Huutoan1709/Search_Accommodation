import React, { useEffect, useState } from 'react';
import API, { endpoints } from '../../../API';
import { useParams } from 'react-router-dom';
import Header from '../../DefaultLayout/Header';
import SliderCustom from '../../DefaultLayout/Slider';
import { PiMapPinAreaFill } from 'react-icons/pi';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { BiArea, BiCabinet } from 'react-icons/bi';
import { CiStopwatch } from 'react-icons/ci';
import { CiHashtag } from 'react-icons/ci';
import { BiBed, BiRuler, BiMoney } from 'react-icons/bi';
import { MdOutlineGavel } from 'react-icons/md';
import { RiFridgeLine } from 'react-icons/ri';
import { FaCouch, FaSnowflake, FaTv } from 'react-icons/fa';
import { GiWashingMachine } from 'react-icons/gi';
import zalo from '../../../assets/zalo.png';
import NewPost from '../../DefaultLayout/NewPost';
import MapBox from '../../../components/MapBox';
import { useNavigate } from 'react-router-dom';
import Footer from '../../DefaultLayout/footer';
import BackToTop from '../../../components/BackToTop';
import { AiFillSafetyCertificate } from 'react-icons/ai';
import { IoIosCall } from 'react-icons/io';
import { SlUserFollow } from 'react-icons/sl';
import AroundPost from '../AroundPost';
function DetailPost() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [amenitiesList, setAmenitiesList] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                let res = await API.get(endpoints['postdetail'](postId));
                setPost(res.data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchAmenities = async () => {
            try {
                let res = await API.get(endpoints['amenities']); // Assuming you have an endpoint for amenities
                setAmenitiesList(res.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchPost();
        fetchAmenities();
    }, [postId]);
    console.log(post);
    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!post) {
        return <div>Loading...</div>;
    }

    const features = [
        { label: 'Diện tích', value: `${post?.room?.area} m²`, icon: <BiRuler size={20} className /> },
        { label: 'Loại phòng', value: post?.room?.room_type?.name, icon: <BiBed size={20} className /> },
        { label: 'Pháp lý', value: 'Sổ đỏ/Sổ hồng', icon: <MdOutlineGavel size={20} /> },
        { label: 'Khu vực', value: `${post?.room?.city}`, icon: <PiMapPinAreaFill size={20} className /> },
        { label: 'Mức giá', value: `${post?.room?.price} triệu/tháng`, icon: <BiMoney size={20} className /> },
        { label: 'Mã tin', value: post?.id, icon: <CiHashtag size={20} className /> },
    ];

    const getAmenityIcon = (name) => {
        const lowercasedName = name.toLowerCase();

        switch (lowercasedName) {
            case 'tủ lạnh':
                return <RiFridgeLine size={20} />;
            case 'máy lạnh':
                return <FaSnowflake size={20} />;
            case 'máy giặt':
                return <GiWashingMachine size={20} />;
            case 'tivi':
                return <FaTv size={20} />;
            case 'tủ quần áo':
                return <BiCabinet size={20} />;
            default:
                return <FaCouch size={20} />;
        }
    };

    const amenities = post?.room?.amenities
        ?.map((amenityId) => {
            const amenity = amenitiesList.find((a) => a.id === amenityId);
            return amenity
                ? {
                      label: amenity.name,
                      icon: getAmenityIcon(amenity.name),
                  }
                : null;
        })
        .filter(Boolean);

    const prices = post?.room?.prices?.map((price) => ({
        label: price.name,
        value: `${price.value} VNĐ/tháng`,
        icon: <BiMoney size={20} />,
    }));

    return (
        <div>
            <Header />
            <div className="w-[1024px] flex m-auto">
                <div className="w-full flex gap-4 mt-6">
                    <div className="w-[70%]">
                        <SliderCustom images={post?.images} video={post.video?.video} />
                        <div className="rounded-md shadow-md bg-white p-4">
                            <h2 className="text-3xl font-semibold text-red-600">{post?.title}</h2>
                            <span className="flex items-center gap-2 my-3">
                                <PiMapPinAreaFill className="text-red-500 mx-1" size={20} />
                                <span className="text-[14px] ">
                                    {post?.room.ward}, {post?.room.district}, {post?.room.city}
                                </span>
                            </span>
                            <div className="h-[35px] flex items-center justify-between mt-4 border border-t-gray-350 border-b-gray-350 pr-2">
                                <span className="flex items-center gap-1">
                                    <MdOutlineAttachMoney size={20} className="text-green-500" />
                                    <span className="font-semibold text-[20px] text-green-500">
                                        {post?.room?.price} triệu/tháng
                                    </span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <BiArea size={20} className="text-gray-400" />
                                    <span>{post?.room?.area} m²</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <CiStopwatch size={20} className="text-gray-500" />
                                    <span>
                                        {formatDistanceToNow(parseISO(post?.created_at), {
                                            addSuffix: true,
                                            locale: vi,
                                        })}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <CiHashtag size={20} className="text-gray-400" />
                                    <span>{post?.id}</span>
                                </span>
                            </div>

                            <div className="mt-8">
                                <h3 className="font-semibold text-[24px] my-5 text-gray-800">Thông tin mô tả:</h3>
                                <div
                                    className="gap-3 flex flex-col bg-gray-50 p-4 rounded-lg border border-gray-200"
                                    dangerouslySetInnerHTML={{ __html: post?.content }}
                                ></div>
                            </div>

                            <div className="mt-8">
                                <h3 className="font-semibold text-[24px] my-5 text-gray-800">Đặc điểm tin đăng:</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between border-b py-2 hover:bg-gray-100 transition duration-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                {feature.icon}
                                                <span className="font-semibold text-gray-700">{feature.label}</span>
                                            </div>
                                            <span className="text-gray-600">{feature.value}</span>
                                        </div>
                                    ))}
                                </div>
                                {amenities.length > 0 && (
                                    <>
                                        <h3 className="font-semibold text-[24px] my-5 text-gray-800">Nội thất:</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {amenities.map((amenity, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between border-b py-2 hover:bg-gray-100 transition duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {amenity.icon}
                                                        <span className="font-semibold text-gray-700">
                                                            {amenity.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {prices.length > 0 && (
                                    <>
                                        <h3 className="font-semibold text-[24px] my-5 text-gray-800">Giá dịch vụ:</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {prices.map((price, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between border-b py-2 hover:bg-gray-100 transition duration-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {price.icon}
                                                        <span className="font-semibold text-gray-700">
                                                            {price.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-600">{price.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="w-full mt-8">
                                <h3 className="font-semibold text-[20px] my-5">Bản đồ</h3>
                                <div className="border border-gray-300 rounded-lg shadow-md overflow-hidden">
                                    <div className="flex items-center justify-between  p-2">
                                        <span className="text-[14px] text-gray-700">
                                            Địa chỉ: {post?.room?.other_address}, {post?.room?.ward},{' '}
                                            {post?.room?.district}, {post?.room?.city}
                                        </span>
                                    </div>
                                    <div className="relative h-[300px]">
                                        <MapBox latitude={post?.room?.latitude} longitude={post?.room?.longitude} />
                                        <div className="absolute top-2 left-2 bg-white p-3 rounded-lg shadow-lg">
                                            <h4 className="font-semibold">{post?.room?.other_address}</h4>
                                            <p className="text-lg text-gray-500">
                                                {post?.room?.ward}, {post?.room?.district}, {post?.room?.city}
                                            </p>

                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${post?.room?.latitude},${post?.room?.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 text-base mt-2 hover:underline flex items-center gap-1"
                                            >
                                                Chỉ đường
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-xl">
                                    Bạn đang xem nội dung tin đăng: "{post?.title} - Mã tin: {post?.id}". Mọi thông tin
                                    liên quan đến tin đăng này chỉ mang tính chất tham khảo. Nếu bạn có phản hồi với tin
                                    đăng này (báo xấu, tin đã cho thuê, không liên lạc được,...), vui lòng thông báo để
                                    có thể xử lý.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-[30%]">
                        <div className=" bg-white p-3 shadow-lg rounded-lg flex flex-col items-center text-center mb-7 border border-gray-300">
                            <img
                                src={post?.user?.avatar || '/default-avatar.png'}
                                alt="Landlord Avatar"
                                className="w-[80px] h-[80px] rounded-full cursor-pointer shadow-lg mt-2"
                                onClick={() => navigate(`/profiles/${post?.user?.id}`)}
                            />
                            <h3 className="mt-2 font-semibold text-[20px] flex items-center gap-1">
                                {post?.user?.first_name} {post?.user?.last_name}
                                <button text="Uy tín">
                                    {post?.user?.reputation && (
                                        <AiFillSafetyCertificate size={20} className="text-green-500" />
                                    )}
                                </button>
                            </h3>

                            <a
                                href={`tel:${post?.landlord?.phone}`}
                                className="flex items-center justify-center w-full mt-4 bg-green-500 text-white py-2 rounded-lg"
                            >
                                <IoIosCall size={20} className="mr-1 text-white " />
                                <span className="mr-2">Gọi {post?.user?.phone}</span>
                            </a>

                            <a
                                href={`https://zalo.me/${post?.user?.phone}`}
                                target="_blank"
                                className=" flex items-center justify-center w-full mt-4  bg-gray-300 py-2 rounded-lg border border-gray-300"
                            >
                                <img src={zalo} alt="Zalo" className="w-8 h-8 object-cover mr-1" />
                                <span className="mr-2">Nhắn Zalo</span>
                            </a>
                            <button className="w-full mt-4 flex items-center justify-center bg-gray-300 border border-gray-300 py-2 rounded-lg">
                                <SlUserFollow size={20} className="mr-1" />
                                <span className="mr-2">Theo dõi</span>
                            </button>
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
            <AroundPost city={post?.room?.city} district={post?.room?.district} currentPostId={post?.id} userId={post?.user?.id}/>

            <BackToTop />
            <Footer />
        </div>
    );
}

export default DetailPost;
