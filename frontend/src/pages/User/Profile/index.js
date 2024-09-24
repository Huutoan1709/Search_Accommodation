import React, { useState } from 'react';
import Header from '../../DefaultLayout/Header';
import SidebarUser from '../../DefaultLayout/SidebarUser';
import CreatePost from '../../Post/CreatePost';
import Updateinfo from '../../User/Updateinfo'; // Component cho việc cập nhật thông tin cá nhân
import ManageRoom from '../../Room/ManageRoom';
import ManagePost from '../../Post/ManagePost'; // Component quản lý tin đăng
import ChangePassword from '../changepassword';

import { useRoutes } from 'react-router-dom';

const Profile = () => {
    let element = useRoutes([
        { path: 'createpost', element: <CreatePost /> },
        { path: 'updateinfo', element: <Updateinfo /> },
        { path: 'manageroom', element: <ManageRoom /> },
        { path: 'managepost', element: <ManagePost /> },
        { path: 'changepassword', element: <ChangePassword /> },
        // Thêm các route khác nếu cần
    ]);

    return (
        <div className="w-full flex flex-col h-screen">
            <Header className="" />
            <div className="flex w-full flex-auto">
                <SidebarUser />
                <div className="flex-auto bg-[#fff] shadow-md p-7 overflow-auto">{element}</div>
            </div>
        </div>
    );
};

export default Profile;
