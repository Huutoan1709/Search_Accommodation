import React from 'react';
import Header from '../../DefaultLayout/Header';
import SidebarUser from '..//../DefaultLayout/SidebarUser';
import CreatePost from '../../Post/CreatePost';
const Profile = () => {
    return (
        <div className="w-full flex flex-col h-screen">
            <Header />
            <div>
                <div className="flex w-full flex-auto">
                    <SidebarUser />
                    <div className=" flex-auto bg-[#fff] shadow-md h-[100vh] p-4">
                        <CreatePost />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
