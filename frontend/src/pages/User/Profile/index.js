import React, { useState } from 'react';
import Header from '../../DefaultLayout/Header';
import SidebarUser from '../../DefaultLayout/SidebarUser';
import CreatePost from '../../Post/CreatePost';
import Updateinfo from '../../User/Updateinfo'; // Component cho việc cập nhật thông tin cá nhân
import ManageRoom from '../../Room/ManageRoom';
import ManagePost from '../../Post/ManagePost'; // Component quản lý tin đăng

import { useRoutes } from 'react-router-dom';

const Profile = () => {
    let element = useRoutes([
        { path: 'createpost', element: <CreatePost /> },
        { path: 'updateinfo', element: <Updateinfo /> },
        { path: 'manageroom', element: <ManageRoom /> },
        { path: 'managepost', element: <ManagePost /> },
        // Thêm các route khác nếu cần
    ]);

    return (
        <div className="w-full flex flex-col h-screen">
            <Header />
            <div className="flex w-full flex-auto">
                <SidebarUser className="position-fixed" />
                <div className="flex-auto bg-[#fff] shadow-md h-[130vh] p-7">{element}</div>
            </div>
        </div>
    );
};

export default Profile;
