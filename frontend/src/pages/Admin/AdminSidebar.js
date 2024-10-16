import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { RiDashboardLine, RiFileListLine, RiUserLine } from 'react-icons/ri';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';
import MyContext from '../../context/MyContext';
import { useNavigate } from 'react-router-dom';
import { MdOutlineArrowOutward } from 'react-icons/md';
import { notifySuccess } from '../../components/ToastManager';
import { IoHomeOutline } from 'react-icons/io5';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { BiSupport } from 'react-icons/bi';

const AdminSidebar = () => {
    const { user, logout } = useContext(MyContext);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const togglePostMenu = () => {
        setIsPostMenuOpen(!isPostMenuOpen);
    };

    const handleLogoutClick = () => {
        if (logout) logout();
        notifySuccess('Đăng xuất thành công');
        navigate('/login');
    };

    const handletoHome = () => {
        navigate('/');
    };

    return (
        <div className="w-[280px] bg-gray-900 text-white min-h-screen p-5">
            <div className="fixed">
                {/* Sidebar Header with User Info */}
                <div className="flex items-center mb-5 p-4 bg-[#333A48] rounded-lg justify-between">
                    <img src={user?.avatar || 'default-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-semibold">
                            {user?.first_name} {user?.last_name}
                        </h2>
                        <span className="text-base text-gray-400">{user?.role}</span>
                    </div>
                    <span onClick={handletoHome} className="cursor-pointer">
                        <MdOutlineArrowOutward size={25} />
                    </span>
                </div>
                {/* Menu */}
                <nav>
                    <ul className="p-4">
                        {/* Dashboard */}
                        <li className="mb-5">
                            <NavLink
                                to="/admin/overview"
                                className={({ isActive }) =>
                                    `p-4 rounded-lg flex items-center ${
                                        isActive ? 'bg-[#333A48] text-white' : 'hover:bg-[#333A48] hover:text-white'
                                    }`
                                }
                            >
                                <RiDashboardLine className="mr-3" />
                                Tổng Quan
                            </NavLink>
                        </li>
                        {/* User Management with Dropdown */}
                        {user?.is_superuser && (
                            <li className="mb-5">
                                <button
                                    onClick={toggleUserMenu}
                                    className="w-full flex items-center justify-between p-4 hover:bg-[#333A48] hover:text-white rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <RiUserLine className="mr-3" />
                                        Quản Lý Người Dùng
                                    </div>

                                    <div className="ml-2">{isUserMenuOpen ? <FaChevronUp /> : <FaChevronDown />}</div>
                                </button>
                                {isUserMenuOpen && (
                                    <ul className="ml-14 mt-2">
                                        <li className="mb-2">
                                            <NavLink
                                                to="/admin/listuser"
                                                className={({ isActive }) =>
                                                    `block p-2 rounded-lg ${
                                                        isActive
                                                            ? 'bg-[#333A48] text-white'
                                                            : 'hover:bg-[#333A48] hover:text-white'
                                                    }`
                                                }
                                            >
                                                Danh sách người dùng
                                            </NavLink>
                                        </li>
                                        <li className="mb-2">
                                            <NavLink
                                                to="/admin/user/permission"
                                                className={({ isActive }) =>
                                                    `block p-2 rounded-lg ${
                                                        isActive
                                                            ? 'bg-[#333A48] text-white'
                                                            : 'hover:bg-[#333A48] hover:text-white'
                                                    }`
                                                }
                                            >
                                                Phân quyền
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        )}
                        {/* Post Management with Dropdown */}
                        <li className="mb-5">
                            <button
                                onClick={togglePostMenu}
                                className="w-full flex items-center justify-between p-4 hover:bg-[#333A48] hover:text-white rounded-lg"
                            >
                                <div className="flex items-center">
                                    <RiFileListLine className="mr-3" />
                                    Quản Lý Bài Đăng
                                </div>
                                {isPostMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            {isPostMenuOpen && (
                                <ul className="ml-14 mt-2">
                                    <li className="mb-2">
                                        <NavLink
                                            to="/admin/post"
                                            className={({ isActive }) =>
                                                `block p-2 rounded-lg ${
                                                    isActive
                                                        ? 'bg-[#333A48] text-white'
                                                        : 'hover:bg-[#333A48] hover:text-white'
                                                }`
                                            }
                                        >
                                            Tổng Quan
                                        </NavLink>
                                    </li>
                                    <li className="mb-2">
                                        <NavLink
                                            to="/admin/approved-post"
                                            className={({ isActive }) =>
                                                `block p-2 rounded-lg ${
                                                    isActive
                                                        ? 'bg-[#333A48] text-white'
                                                        : 'hover:bg-[#333A48] hover:text-white'
                                                }`
                                            }
                                        >
                                            Duyệt tin đăng
                                        </NavLink>
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li className="mb-5">
                            <NavLink
                                to="/admin/roomtype"
                                className={({ isActive }) =>
                                    `p-4 rounded-lg flex items-center ${
                                        isActive ? 'bg-[#333A48] text-white' : 'hover:bg-[#333A48] hover:text-white'
                                    }`
                                }
                            >
                                <IoHomeOutline className="mr-3" />
                                Quản lý loại phòng
                            </NavLink>
                        </li>
                        <li className="mb-5">
                            <NavLink
                                to="/admin/supportrequest"
                                className={({ isActive }) =>
                                    `p-4 rounded-lg flex items-center ${
                                        isActive ? 'bg-[#333A48] text-white' : 'hover:bg-[#333A48] hover:text-white'
                                    }`
                                }
                            >
                                <BiSupport className="mr-3" />
                                Xử lý yêu cầu hỗ trợ
                            </NavLink>
                        </li>
                        <li className="mb-5">
                            <NavLink
                                to="/profile/updateinfo"
                                className={({ isActive }) =>
                                    `p-4 rounded-lg flex items-center ${
                                        isActive ? 'bg-[#333A48] text-white' : 'hover:bg-[#333A48] hover:text-white'
                                    }`
                                }
                            >
                                <MdOutlineAccountCircle className="mr-3" />
                                Thông tin cá nhân
                            </NavLink>
                        </li>
                        {/* Logout */}
                        <li className="mb-5">
                            <button
                                onClick={handleLogoutClick}
                                className="p-4 rounded-lg flex items-center hover:bg-[#333A48] hover:text-white"
                            >
                                <BiLogOut className="mr-3" />
                                Đăng xuất
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default AdminSidebar;
