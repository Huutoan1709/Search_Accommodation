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
function Home() {
    return (
        <div>
            <Header />
            <div className="w-[1024px] m-auto">
                <div>
                    <h1 className="mt-4 mb-0 text-[24px] font-bold">
                        Kênh thông tin tìm kiếm Phòng Trọ uy tín chất lượng
                    </h1>
                    <p className="text-gray-600 text-[14px]">
                        Websites đăng tin cho thuê phòng trọ, nhà nguyên căn, căn hộ dịch vụ, căn hộ mini hiệu quả với
                        100.000+ bài đăng và 1.000.000 lượt xem mỗi tháng
                    </p>
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
            <Footer />
        </div>
    );
}

export default Home;
