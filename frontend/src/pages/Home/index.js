import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeStyle.scss';
import '../../output.css';
import { search } from '../DefaultLayout/Search';
import Header from '../DefaultLayout/Header';
import ListPost from '../Post/ListPost';
import Sidebar from '../DefaultLayout/Sidebar';

function Home() {
    return (
        <div className="bg-slate-50">
            <Header />
            <div className="w-[1024px] flex m-auto">
                <div className="flex w-full gap-4">
                    <div className="w-[70%]">
                        <ListPost />
                    </div>
                    <div className="w-[30%] border flex flex-col gap-4 justify-start items-center ">
                        <Sidebar />
                        <Sidebar />
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
