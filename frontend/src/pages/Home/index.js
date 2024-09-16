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

function Home() {
    return (
        <div>
            <Header />
            <div className="w-[1024px] flex m-auto">
                <div className="flex w-full gap-4">
                    <div className="w-[70%] ">
                        <ListPost />
                    </div>
                    <div className="w-[30%] flex flex-col gap-4 justify-start items-center ">
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
