import React, { useState } from 'react';
import Header from '../../DefaultLayout/Header';
import SidebarUser from '../../DefaultLayout/SidebarUser';
import CreatePost from '../../Post/CreatePost';
import Updateinfo from '../../User/Updateinfo'; // Component cho việc cập nhật thông tin cá nhân
import ManageRoom from '../../Room/ManageRoom';
import ManagePost from '../../Post/ManagePost'; // Component quản lý tin đăng

const Profile = () => {
    const [activeSection, setActiveSection] = useState('createPost');

    const renderContent = () => {
        switch (activeSection) {
            case 'createPost':
                return <CreatePost />;
            case 'updateInfo':
                return <Updateinfo />;
            case 'manageroom':
                return <ManageRoom />;
            case 'managepost':
                return <ManagePost />;
            case 'resetpassword':
                return (
                    <div>
                        <h1>Đổi mật khẩu</h1>
                    </div>
                );
            default:
                return <CreatePost />;
        }
    };
    return (
        <div className="w-full flex flex-col h-screen">
            <Header />
            <div>
                <div className="flex w-full flex-auto">
                    <SidebarUser setActiveSection={setActiveSection} activeSection={activeSection} />
                    <div className="flex-auto bg-[#fff] shadow-md h-[100vh] p-7">{renderContent()}</div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
