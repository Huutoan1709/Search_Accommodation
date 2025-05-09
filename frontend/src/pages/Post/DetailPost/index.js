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
import { motion } from 'framer-motion';
import Loading from '../../../components/Loading';

function DetailPost() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [amenitiesList, setAmenitiesList] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [postRes, amenitiesRes] = await Promise.all([
                    API.get(endpoints['postdetail'](postId)),
                    API.get(endpoints['amenities'])
                ]);
                
                setPost(postRes.data);
                setAmenitiesList(amenitiesRes.data);
            } catch (err) {
                console.error('Error fetching post details:', err);
                setError('Không thể tải thông tin bài đăng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId]);

    if (loading) {
        return (
            <div>
                <Header />
                <div className="w-[1024px] m-auto mt-4">
                    <Loading message="Đang tải thông tin bài đăng..." />
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="w-[1024px] m-auto mt-4">
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-md">
                        <div className="text-red-500 text-xl mb-4">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-lg text-center px-4">{error}</p>
                        <button 
                            onClick={() => navigate(-1)}
                            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div>
                <Header />
                <div className="w-[1024px] m-auto mt-4">
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-md">
                        <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                            Không tìm thấy bài đăng
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-4">
                            Bài đăng này không tồn tại hoặc đã bị xóa.
                        </p>
                        <button 
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
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
        <div className="min-h-screen bg-gray-50">
            <Header />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-[1024px] mx-auto py-6"
            >
                <div className="flex gap-6">
                    {/* Main Content Column */}
                    <div className="w-[70%] space-y-6">
                        {/* Image Slider */}
                        <div className="rounded-xl overflow-hidden shadow-lg">
                            <SliderCustom images={post?.images} video={post?.video?.video} />
                        </div>

                        {/* Post Details */}
                        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                            {/* Title & Location */}
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                                    {post?.title}
                                </h2>
                                <div className="flex items-center text-gray-600">
                                    <PiMapPinAreaFill className="text-amber-500 mr-2" size={20} />
                                    <span className="text-xl">
                                        {post?.room?.ward}, {post?.room?.district}, {post?.room?.city}
                                    </span>
                                </div>
                            </div>

                            {/* Key Information */}
                            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <MdOutlineAttachMoney size={24} className="text-green-500" />
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {post?.room?.price} triệu
                                        </p>
                                        <p className="text-sm text-gray-500">mỗi tháng</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BiArea size={24} className="text-amber-500" />
                                    <div>
                                        <p className="text-2xl font-bold text-gray-700">
                                            {post?.room?.area} m²
                                        </p>
                                        <p className="text-sm text-gray-500">diện tích</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CiStopwatch size={24} className="text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {formatDistanceToNow(parseISO(post?.created_at), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-500">đăng tin</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800">Thông tin mô tả</h3>
                                <div className="prose max-w-none bg-gray-50 p-6 rounded-lg"
                                    dangerouslySetInnerHTML={{ __html: post?.content }}>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800">Đặc điểm tin đăng</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {features.map((feature, index) => (
                                        <div key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-full shadow-sm">
                                                    {feature.icon}
                                                </div>
                                                <span className="font-medium text-gray-700">{feature.label}</span>
                                            </div>
                                            <span className="text-gray-600">{feature.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities Section */}
                            {amenities.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-800">Tiện nghi</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {amenities.map((amenity, index) => (
                                            <div key={index}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="p-2 bg-white rounded-full shadow-sm">
                                                    {amenity.icon}
                                                </div>
                                                <span className="font-medium text-gray-700">
                                                    {amenity.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Map Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800">Vị trí trên bản đồ</h3>
                                <div className="rounded-xl overflow-hidden shadow-lg">
                                    <div className="relative h-[400px]">
                                        <MapBox 
                                            latitude={post?.room?.latitude} 
                                            longitude={post?.room?.longitude} 
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-[300px]">
                                            <h4 className="font-bold text-gray-800 mb-1">
                                                {post?.room?.other_address}
                                            </h4>
                                            <p className="text-lg text-gray-600 mb-3">
                                                {post?.room?.ward}, {post?.room?.district}, {post?.room?.city}
                                            </p>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${post?.room?.latitude},${post?.room?.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                                Chỉ đường
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-[30%] space-y-6 ">
                        {/* User Profile Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex flex-col items-center">
                                <img
                                    src={post?.user?.avatar || '/default-avatar.png'}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-full object-cover border-4 border-amber-500 cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => navigate(`/profiles/${post?.user?.id}`)}
                                />
                                <h3 className="mt-4 text-xl font-bold text-gray-800 flex items-center gap-2">
                                    {post?.user?.first_name} {post?.user?.last_name}
                                    {post?.user?.reputation && (
                                        <AiFillSafetyCertificate className="text-green-500" size={20} />
                                    )}
                                </h3>
                            </div>

                            <div className="mt-6 space-y-3 ">
                                <a
                                    href={`tel:${post?.user?.phone}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <IoIosCall size={20} />
                                    <span>Gọi {post?.user?.phone}</span>
                                </a>

                                <a
                                    href={`https://zalo.me/${post?.user?.phone}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <img src={zalo} alt="Zalo" className="w-6 h-6" />
                                    <span>Nhắn Zalo</span>
                                </a>

                                <button className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                    <SlUserFollow size={20} />
                                    <span>Theo dõi</span>
                                </button>
                            </div>
                        </div>

                        {/* New Posts Section */}
                        <div className="bg-wgite rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-300 flex items-center gap-2">
                                Tin mới đăng
                            </h3>
                            <NewPost />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Related Posts */}
            <AroundPost
                city={post?.room?.city}
                district={post?.room?.district}
                currentPostId={post?.id}
                userId={post?.user?.id}
            />

            <BackToTop />
            <Footer />
        </div>
    );
}

export default DetailPost;
