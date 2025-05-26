import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeStyle.scss';
import '../../output.css';
import Header from '../DefaultLayout/Header';
import ListPost from '../Post/ListPost';
import Sidebar from '../DefaultLayout/Sidebar';
import Footer from '../DefaultLayout/footer';
import binhduong from '../../assets/binhduong.jpg';
import hanoi from '../../assets/hanoi.jpg';
import binhphuoc from '../../assets/binhphuoc.jpg';
import hochiminh from '../../assets/ho-chi-minh.jpg';
import danang from '../../assets/danang.jpg';
import Search from '../DefaultLayout/Search';
import BackToTop from '../../components/BackToTop';
import ChatBot from '../../components/ChatBot';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';
import RecommendedRooms from '../../components/RecommendedRooms';
import MyContext from '../../context/MyContext';
import { FaHome, FaUsers, FaCheckCircle, FaStar } from 'react-icons/fa';

const Home = ({ room_type = '' }) => {
    const [searchParams, setSearchParams] = useState({ room_type });
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = useContext(MyContext);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            // Remove the headerHeight check since we'll use a fixed value
            setIsScrolled(scrollPosition > 200);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const initializePage = async () => {
            try {
                setLoading(true);
                if (!searchParams.room_type) {
                    setSearchParams((prevParams) => ({
                        ...prevParams,
                        room_type: room_type,
                    }));
                }
                // Simulate loading time for better UX
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                console.error('Error initializing page:', error);
            } finally {
                setLoading(false);
            }
        };

        initializePage();
    }, [room_type]);

    const handleSearch = (params) => {
        const updatedParams = { ...params, room_type };
        setSearchParams(updatedParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCityClick = (city) => {
        const params = { city, room_type: searchParams.room_type };
        handleSearch(params);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-[1024px] mx-auto mt-8"
                >
                    <Loading message="Đang tải trang chủ..." />
                </motion.div>
                <Footer />
            </div>
        );
    }

    return (
        <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className='relative'>
                <Header />
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 mb-8">
                    <div className="w-[1024px] mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">
                            Kênh thông tin Phòng Trọ Việt Nam
                        </h1>
                        <p className="text-xl opacity-90">
                            Tìm phòng trọ nhanh chóng, thuận tiện và hoàn toàn miễn phí
                        </p>
                    </div>
                </div>
                <div className="w-[1024px] m-auto mt-5"> {/* Add fixed padding-top */}
                    
                    <div className={`
                        transition-all duration-300 ease-in-out
                        ${isScrolled ? 
                            'fixed left-0 right-0 z-40 bg-white shadow-lg py-3 top-[60px]' : 
                            'w-full'
                        }
                    `}>
                        <div className={`
                            max-w-[1024px] mx-auto
                            ${isScrolled ? 'px-1' : ''}
                        `}>
                            <Search 
                                setSearchParams={setSearchParams} 
                                room_type={room_type} 
                            />
                        </div>
                    </div>
                    <div className={`${isScrolled ? 'h-[60px]' : ''}`} />
                    
                    <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
                        <div className="grid grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="flex justify-center">
                                    <FaHome className="text-4xl text-blue-500 mb-3" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">1000+</h3>
                                <p className="text-gray-600">Phòng cho thuê</p>
                            </div>
                            <div className="text-center">
                                <div className="flex justify-center">
                                    <FaUsers className="text-4xl text-green-500 mb-3" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">500+</h3>
                                <p className="text-gray-600">Người dùng tin cậy</p>
                            </div>
                            <div className="text-center">
                                <div className="flex justify-center">
                                    <FaCheckCircle className="text-4xl text-yellow-500 mb-3" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">98%</h3>
                                <p className="text-gray-600">Khách hàng hài lòng</p>
                            </div>
                            <div className="text-center">
                                <div className="flex justify-center">
                                    <FaStar className="text-4xl text-red-500 mb-3" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">4.8/5</h3>
                                <p className="text-gray-600">Đánh giá trung bình</p>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-[20px] font-semibold mt-8 text-center">Thành phố nổi bật</h1>
                    <div className="my-10 flex gap-4 p-2">
                        <div
                            className="relative w-1/3 group cursor-pointer"
                            onClick={() => handleCityClick('Thành phố Hồ Chí Minh')}
                        >
                            <img src={hochiminh} alt="Hồ Chí Minh" className="rounded-lg object-cover w-full h-[310px]" />
                            <div className="absolute inset-0 to-transparent bg-gradient-to-t group-hover:from-black/70 group-hover:to-transparent group-hover:bg-opacity-90 text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300 from-black/20">
                                <h3 className="text-2xl font-bold">Hồ Chí Minh</h3>
                                <p className="text-lg"></p>
                            </div>
                        </div>
                        <div className="w-2/3 grid grid-cols-2 gap-4 cursor-pointer">
                            <div className="relative group" onClick={() => handleCityClick('Thành phố Hà Nội')}>
                                <img src={hanoi} alt="Hà Nội" className="rounded-lg object-cover w-full h-[150px]" />
                                <div className="absolute inset-0 to-transparent bg-gradient-to-t group-hover:from-black/70 group-hover:to-transparent group-hover:bg-opacity-90 text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300 from-black/20">
                                    <h3 className="text-2xl font-bold">Hà Nội</h3>
                                    <p className="text-lg"></p>
                                </div>
                            </div>
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => handleCityClick('Tỉnh Bình Dương')}
                            >
                                <img
                                    src={binhduong}
                                    alt="Bình Dương"
                                    className="rounded-lg object-cover w-full h-[150px]"
                                />
                                <div className="absolute inset-0 to-transparent bg-gradient-to-t group-hover:from-black/70 group-hover:to-transparent group-hover:bg-opacity-90 text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300 from-black/20">
                                    <h3 className="text-2xl font-bold">Bình Dương</h3>
                                    <p className="text-lg"></p>
                                </div>
                            </div>
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => handleCityClick('Thành phố Đà Nẵng')}
                            >
                                <img src={danang} alt="Đà Nẵng" className="rounded-lg object-cover w-full h-[150px]" />
                                <div className="absolute inset-0  to-transparent bg-gradient-to-t group-hover:from-black/70 group-hover:to-transparent group-hover:bg-opacity-90 text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300 from-black/20">
                                    <h3 className="text-2xl font-bold ">Đà Nẵng</h3>
                                    <p className="text-lg"></p>
                                </div>
                            </div>
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => handleCityClick('Tỉnh Bình Phước')}
                            >
                                <img
                                    src={binhphuoc}
                                    alt="Bình Phước"
                                    className="rounded-lg object-cover w-full h-[150px]"
                                />
                                <div className="absolute inset-0  to-transparent bg-gradient-to-t group-hover:from-black/70 group-hover:to-transparent group-hover:bg-opacity-90 text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300 from-black/20">
                                    <h3 className="text-2xl font-bold">Bình Phước</h3>
                                    <p className="text-lg"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full gap-4">
                        <div className="w-[70%] ">
                            <ListPost searchParams={searchParams} room_type={searchParams.room_type} />
                        </div>
                        
                        <div className="w-[30%] flex flex-col gap-4 justify-start items-center ">
                            <Sidebar setSearchParams={setSearchParams} room_type={room_type} searchParams={searchParams} />
                        </div>
                    </div>
                    <div className='w-full flex justify-center items-center'>
                        {/* Chỉ hiển thị khi có user */}
                        {user && <RecommendedRooms />}
                    </div>

                </div>
                
                <div className="bg-gray-50 py-16">
                    <div className="w-[1024px] mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
                        <div className="grid grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <FaHome className="text-2xl text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Đa dạng lựa chọn</h3>
                                <p className="text-gray-600">
                                    Hàng nghìn phòng trọ được cập nhật hằng ngày, đa dạng mức giá, diện tích.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <FaCheckCircle className="text-2xl text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Thông tin tin cậy</h3>
                                <p className="text-gray-600">
                                    Thông tin được kiểm duyệt kỹ càng, đảm bảo tin đăng chính xác và đáng tin cậy.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                    <FaStar className="text-2xl text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Dịch vụ tốt nhất</h3>
                                <p className="text-gray-600">
                                    Hỗ trợ 24/7, tư vấn nhiệt tình, giúp bạn tìm được phòng ưng ý nhanh chóng.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <ChatBot />
                <BackToTop />
                <Footer />
            </div>
        </motion.div>
    );
};

export default Home;
