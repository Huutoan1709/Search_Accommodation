import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { RiDashboardLine, RiFileListLine, RiMoneyCnyBoxLine, RiUserLine } from 'react-icons/ri';
import { FaChevronDown } from 'react-icons/fa';
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

    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
    const togglePostMenu = () => setIsPostMenuOpen(!isPostMenuOpen);

    const handleLogoutClick = () => {
        if (logout) logout();
        notifySuccess('Đăng xuất thành công');
        navigate('/login');
    };

    const handletoHome = () => navigate('/');

    const MenuLink = ({ to, icon: Icon, children }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `p-3 rounded-lg flex items-center transition-all duration-200 ${
                    isActive 
                        ? 'bg-purple-500/10 text-purple-500 font-medium' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`
            }
        >
            <Icon className="w-5 h-5 mr-3" />
            <span>{children}</span>
        </NavLink>
    );

    return (
        <div className="w-[280px] bg-[#1E1E2D] min-h-screen">
            <div className="fixed w-[280px] h-screen overflow-y-auto scrollbar-thin scrollbar-track-[#1E1E2D] scrollbar-thumb-gray-700">
                {/* User Profile Section */}
                <div className="p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <img 
                                src={user?.avatar || 'default-avatar.png'} 
                                alt="Avatar" 
                                className="w-16 h-16 rounded-xl object-cover ring-2 ring-purple-500 ring-offset-2 ring-offset-[#1E1E2D]" 
                            />
                            <div 
                                onClick={handletoHome}
                                className="absolute -top-2 -right-2 bg-purple-500 p-1.5 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors"
                            >
                                <MdOutlineArrowOutward size={16} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {user?.first_name} {user?.last_name}
                            </h2>
                            <span className="text-sm text-purple-400 font-medium">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        {/* Dashboard */}
                        <li>
                            <MenuLink to="/admin/overview" icon={RiDashboardLine}>
                                Tổng Quan
                            </MenuLink>
                        </li>
                        <li>
                            <MenuLink to="/admin/payment" icon={RiMoneyCnyBoxLine}>
                                Doanh Thu
                            </MenuLink>
                        </li>

                        {/* User Management */}
                        {user?.is_superuser && (
                            <li>
                                <button
                                    onClick={toggleUserMenu}
                                    className="w-full p-3 rounded-lg flex items-center justify-between text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                                >
                                    <div className="flex items-center">
                                        <RiUserLine className="w-5 h-5 mr-3" />
                                        <span>Quản Lý Người Dùng</span>
                                    </div>
                                    <FaChevronDown 
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                            isUserMenuOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                                {isUserMenuOpen && (
                                    <ul className="mt-2 ml-4 pl-4 border-l border-gray-700/50 space-y-2">
                                        <li>
                                            <MenuLink to="/admin/listuser" icon={RiUserLine}>
                                                Danh sách người dùng
                                            </MenuLink>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        )}

                        {/* Post Management */}
                        <li>
                            <button
                                onClick={togglePostMenu}
                                className="w-full p-3 rounded-lg flex items-center justify-between text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                            >
                                <div className="flex items-center">
                                    <RiFileListLine className="w-5 h-5 mr-3" />
                                    <span>Quản Lý Bài Đăng</span>
                                </div>
                                <FaChevronDown 
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                        isPostMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {isPostMenuOpen && (
                                <ul className="mt-2 ml-4 pl-4 border-l border-gray-700/50 space-y-2">
                                    <li>
                                        <MenuLink to="/admin/post" icon={RiFileListLine}>
                                            Tổng Quan
                                        </MenuLink>
                                    </li>
                                    <li>
                                        <MenuLink to="/admin/approved-post" icon={RiFileListLine}>
                                            Duyệt tin đăng
                                        </MenuLink>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Other Menu Items */}
                        <li>
                            <MenuLink to="/admin/roomtype" icon={IoHomeOutline}>
                                Quản lý loại phòng
                            </MenuLink>
                        </li>
                        <li>
                            <MenuLink to="/admin/amenities" icon={IoHomeOutline}>
                                Quản lý tiện ích
                            </MenuLink>
                        </li>
                        <li>
                            <MenuLink to="/admin/supportrequest" icon={BiSupport}>
                                Xử lý yêu cầu hỗ trợ
                            </MenuLink>
                        </li>
                        <li>
                            <MenuLink to="/profile/updateinfo" icon={MdOutlineAccountCircle}>
                                Thông tin cá nhân
                            </MenuLink>
                        </li>

                        {/* Logout Button */}
                        <li className="pt-4 mt-4 border-t border-gray-700/50">
                            <button
                                onClick={handleLogoutClick}
                                className="w-full p-3 rounded-lg flex items-center text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                            >
                                <BiLogOut className="w-5 h-5 mr-3" />
                                <span className="font-medium">Đăng xuất</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default AdminSidebar;
