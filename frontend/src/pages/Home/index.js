import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeStyle.scss';
import '../../output.css';
import { search } from '../DefaultLayout/Search';
import Header from '../DefaultLayout/Header';
import ListPost from '../Post/ListPost';
import Sidebar from '../DefaultLayout/Sidebar';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Footer from '../DefaultLayout/footer';
import binhduong from '../../assets/binhduong.jpg';
import hanoi from '../../assets/hanoi.jpg';
import binhphuoc from '../../assets/binhphuoc.jpg';
import hochiminh from '../../assets/ho-chi-minh.jpg';
import danang from '../../assets/danang.jpg';
import Search from '../DefaultLayout/Search';
function Home() {
    const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScroll(true);
            } else {
                setShowScroll(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (
        <>
            <Header />
            <div className="w-[1024px] m-auto">
                <div className="p-2">
                    <h1 className="mt-4 mb-0 text-[24px] font-bold text-center">
                        Kênh thông tin tìm kiếm Phòng Trọ uy tín chất lượng
                    </h1>
                    <p className="text-gray-600 text-[14px]">
                        Websites đăng tin cho thuê phòng trọ, nhà nguyên căn, căn hộ dịch vụ, căn hộ mini hiệu quả với
                        100.000+ bài đăng và 1.000.000 lượt xem mỗi tháng
                    </p>
                </div>
                <Search />
                <div className="my-14 flex gap-4 p-2">
                    <div className="relative w-1/3 group cursor-pointer">
                        <img src={hochiminh} alt="Hồ Chí Minh" className="rounded-lg object-cover w-full h-[310px]" />
                        <div className="absolute inset-0 from-transparent to-transparent bg-gradient-to-t group-hover:from-black group-hover:to-transparent text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300">
                            <h3 className="text-2xl font-bold">Hồ Chí Minh</h3>
                            <p className="text-lg">1.260 tin đăng</p>
                        </div>
                    </div>

                    <div className="w-2/3 grid grid-cols-2 gap-4 cursor-pointer">
                        <div className="relative group">
                            <img src={hanoi} alt="Hà Nội" className="rounded-lg object-cover w-full h-[150px]" />
                            <div className="absolute inset-0 from-transparent to-transparent bg-gradient-to-t group-hover:from-black group-hover:to-transparent text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300">
                                <h3 className="text-2xl font-bold">Hà Nội</h3>
                                <p className="text-lg">1.260 tin đăng</p>
                            </div>
                        </div>
                        <div className="relative group cursor-pointer">
                            <img
                                src={binhduong}
                                alt="Bình Dương"
                                className="rounded-lg object-cover w-full h-[150px]"
                            />
                            <div className="absolute inset-0 from-transparent to-transparent bg-gradient-to-t group-hover:from-black group-hover:to-transparent text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300">
                                <h3 className="text-2xl font-bold">Bình Dương</h3>
                                <p className="text-lg">1.260 tin đăng</p>
                            </div>
                        </div>
                        <div className="relative group cursor-pointer">
                            <img src={danang} alt="Đà Nẵng" className="rounded-lg object-cover w-full h-[150px]" />
                            <div className="absolute inset-0 from-transparent to-transparent bg-gradient-to-t group-hover:from-black group-hover:to-transparent text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300">
                                <h3 className="text-2xl font-bold">Đà Nẵng</h3>
                                <p className="text-lg">1.260 tin đăng</p>
                            </div>
                        </div>
                        <div className="relative group cursor-pointer">
                            <img
                                src={binhphuoc}
                                alt="Bình Phước"
                                className="rounded-lg object-cover w-full h-[150px]"
                            />
                            <div className="absolute inset-0 from-transparent to-transparent bg-gradient-to-t group-hover:from-black group-hover:to-transparent text-white rounded-lg p-6 flex flex-col justify-end transition-all duration-300">
                                <h3 className="text-2xl font-bold">Bình Phước</h3>
                                <p className="text-lg">1.260 tin đăng</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full gap-4">
                    <div className="w-[70%] ">
                        <ListPost />
                    </div>
                    <div className="w-[30%] flex flex-col gap-4 justify-start items-center ">
                        <Sidebar />
                    </div>
                </div>
            </div>
            {/* Nút Back to Top */}
            {showScroll && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8  text-white  bg-red-500 p-4 rounded-full shadow-xl"
                    style={{ zIndex: 1000 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            )}
            <Footer />
        </>
    );
}

export default Home;
