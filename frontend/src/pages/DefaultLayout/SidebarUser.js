import React, { memo, useContext } from 'react';
import MyContext from '../../context/MyContext';
import { CiLogout } from 'react-icons/ci';
import { RiLockPasswordLine } from 'react-icons/ri';
import { MdFormatListBulletedAdd } from 'react-icons/md';
import { BsHouseCheck } from 'react-icons/bs';
import { LuFileHeart } from 'react-icons/lu';
import { FaRegEdit } from 'react-icons/fa';
import { LuFileEdit } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
const SidebarUser = ({ setActiveSection, activeSection }) => {
    const { user, logout } = useContext(MyContext);
    const navigate = useNavigate();
    const handleLogoutClick = () => {
        if (logout) logout();
        navigate('/');
        window.location.reload();
    };
    return (
        <div className="w-[256px] flex-none p-6 shadow-lg">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                    <img
                        src={user?.avatar || 'default-avatar.png'}
                        alt="avatar"
                        className="w-20 h-20 object-cover rounded-full border-2 border-white"
                    />
                    <div className="flex flex-col justify-center">
                        <span className="font-semibold text-[18px]">
                            {user?.first_name || 'Tên người dùng'} {user?.last_name || 'Họ'}
                        </span>{' '}
                        <small className="text-[14px]">{user?.phone || 'Số điện thoại'}</small>
                    </div>
                </div>
                <span className="font-medium p-2">
                    Mã thành viên: <span className="font-bold">{user?.id || 'N/A'}</span>
                </span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
                <div
                    className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                        activeSection === 'createPost' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('createPost')}
                >
                    <MdFormatListBulletedAdd size={20} className="font-normal text-gray-500" />
                    <span className="w-full font-normal ml-3">Đăng tin cho thuê</span>
                </div>
                <div
                    className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                        activeSection === 'managepost' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('managepost')}
                >
                    <LuFileEdit size={20} className="font-normal text-gray-500" />
                    <span className="w-full font-normalnormal ml-3 ">Quản lý tin đăng</span>
                </div>
                <div
                    className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                        activeSection === 'manageroom' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('manageroom')}
                >
                    <BsHouseCheck size={20} className="font-normal text-gray-500" />
                    <span className=" w-full font-normal ml-3 ">Quản lý phòng</span>
                </div>
                <div
                    className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                        activeSection === 'updateInfo' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('updateInfo')}
                >
                    <FaRegEdit size={20} className="font-normal text-gray-500" />
                    <span className="w-full font-normal ml-3">Sửa thông tin cá nhân</span>
                </div>
                <div
                    className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                        activeSection === 'resetpassword' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('resetpassword')}
                >
                    <RiLockPasswordLine size={20} className="font-normal text-gray-500" />
                    <span className="w-full font-normal ml-3">Đổi mật khẩu</span>
                </div>
                <div
                    className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                        activeSection === 'createPost' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('createPost')}
                >
                    <LuFileHeart size={20} className="font-normal text-gray-500" />
                    <span className="w-full font-normal ml-3 ">Bài viết yêu thích</span>
                </div>
                <div
                    className="flex items-center  hover:bg-slate-200 p-2  border-b border-gray-300 border-dashed cursor-pointer"
                    onClick={handleLogoutClick}
                >
                    <CiLogout size={20} className="font-normal" />
                    <span className="w-full font-normal ml-3">Đăng xuất</span>
                </div>
            </div>
        </div>
    );
};

export default memo(SidebarUser);
