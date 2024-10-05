import React, { useState } from 'react';
import Header from '../../DefaultLayout/Header';
import SidebarUser from '../../DefaultLayout/SidebarUser';
import CreatePost from '../../Post/CreatePost';
import Updateinfo from '../../User/Updateinfo';
import ManageRoom from '../../Room/ManageRoom';
import ManagePost from '../../Post/ManagePost';
import MyReviews from '../../User/Myreviews/MyReview';
import { useRoutes } from 'react-router-dom';

const Profile = () => {
    let element = useRoutes([
        { path: 'createpost', element: <CreatePost /> },
        { path: 'updateinfo', element: <Updateinfo /> },
        { path: 'manageroom', element: <ManageRoom /> },
        { path: 'managepost', element: <ManagePost /> },
        { path: 'myreviews', element: <MyReviews /> },
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
