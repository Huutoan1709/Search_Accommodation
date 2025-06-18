import React, { memo, useContext } from 'react';
import MyContext from '../../context/MyContext';
import { CiLogout } from 'react-icons/ci';
import { MdFormatListBulletedAdd } from 'react-icons/md';
import { BsHouseCheck } from 'react-icons/bs';
import { FaRegEdit } from 'react-icons/fa';
import { LuFileEdit } from 'react-icons/lu';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImProfile } from 'react-icons/im';
import { BiHeart, BiSupport } from 'react-icons/bi';
import { GoCodeReview } from 'react-icons/go';
import { GrNavigate } from 'react-icons/gr';
import { notifySuccess } from '../../components/ToastManager';
import { MdRateReview } from 'react-icons/md';

const SidebarUser = ({ onClose }) => {
    const location = useLocation();
    const activeSection = location.pathname.split('/')[2];
    const { user, logout } = useContext(MyContext);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        if (logout) logout();
        navigate('/');
        notifySuccess('Đăng xuất thành công');
    };

    const navigateToSection = (section) => {
        navigate(`/profile/${section}`);
    };

    const handleUserPageClick = () => {
        navigate('/profiles/current/');
    };

    const handleToRequest = () => {
        navigate('/supportrequest');
    };

    const handleFavoritePostClick = () => {
        navigate('/favorite');
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Mobile Close Button - Only show on mobile/tablet */}
            <div className="lg:hidden flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" 
                        />
                    </svg>
                </button>
            </div>

            <div className="w-[280px] flex-none bg-white shadow-lg border-r border-gray-100">
                <div className="fixed w-[280px] h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {/* User Profile Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex gap-4 items-center">
                            <div className="relative group">
                                <img
                                    src={user?.avatar || 'default-avatar.png'}
                                    alt="avatar"
                                    className="w-20 h-20 object-cover rounded-full ring-2 ring-amber-500 ring-offset-2 transition-all duration-300"
                                />
                                <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="text-white text-sm">Xem hồ sơ</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="font-semibold text-3xl text-gray-800">
                                    {user?.first_name || 'Tên'} {user?.last_name || ''}
                                </span>
                                <span className="text-2xl text-gray-500">{user?.phone || 'Số điện thoại'}</span>
                                <span className="text-xl text-amber-600 mt-1">ID: {user?.id || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-4 space-y-2 text-2xl">
                        {user?.role === 'LANDLORD' && (
                            <div className="space-y-2">
                                {[
                                    {
                                        icon: <MdFormatListBulletedAdd size={20} />,
                                        label: 'Đăng tin cho thuê',
                                        section: 'createpost',
                                    },
                                    {
                                        icon: <LuFileEdit size={20} />,
                                        label: 'Quản lý tin đăng',
                                        section: 'managepost',
                                    },
                                    {
                                        icon: <BsHouseCheck size={20} />,
                                        label: 'Quản lý phòng',
                                        section: 'manageroom',
                                    },
                                    {
                                        icon: <MdRateReview size={20} />,
                                        label: 'Đánh giá nhận được',
                                        section: 'receivedreviews',
                                    },
                                    {  
                                        icon: <BiHeart size={20} />,
                                        label: 'Lịch sử giao dịch',
                                        section: 'paymenthistory',
                                    }
                                ].map((item) => (
                                    <div
                                        key={item.section}
                                        onClick={() => navigateToSection(item.section)}
                                        className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                                            ${activeSection === item.section 
                                                ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' 
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="flex items-center justify-center w-6 h-6">{item.icon}</span>
                                        <span className="ml-3">{item.label}</span>
                                    </div>
                                ))}

                                <div
                                    onClick={handleUserPageClick}
                                    className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                                        ${activeSection === 'current' 
                                            ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="flex items-center justify-center w-6 h-6">
                                        <ImProfile size={20} />
                                    </span>
                                    <span className="ml-3">Trang cá nhân</span>
                                </div>
                            </div>
                        )}

                        {/* Common Navigation Items */}
                        <div className="space-y-2">
                            <div
                                onClick={() => navigateToSection('updateinfo')}
                                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                                    ${activeSection === 'updateinfo' 
                                        ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="flex items-center justify-center w-6 h-6">
                                    <FaRegEdit size={20} />
                                </span>
                                <span className="ml-3">Sửa thông tin cá nhân</span>
                            </div>

                            {/* Customer specific items */}
                            {user?.role === 'CUSTOMER' && (
                                <div
                                    onClick={() => navigateToSection('myreviews')}
                                    className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                                        ${activeSection === 'myreviews' 
                                            ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="flex items-center justify-center w-6 h-6">
                                        <GoCodeReview size={20} />
                                    </span>
                                    <span className="ml-3">Quản lý đánh giá</span>
                                </div>
                            )}

                            {/* Common Features */}
                            <div
                                onClick={handleFavoritePostClick}
                                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                                    ${activeSection === 'favorite' 
                                        ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="flex items-center justify-center w-6 h-6">
                                    <BiHeart size={20} />
                                </span>
                                <span className="ml-3">Tin yêu thích</span>
                            </div>

                            <div
                                onClick={handleToRequest}
                                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                                    ${activeSection === 'supportrequest' 
                                        ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="flex items-center justify-center w-6 h-6">
                                    <BiSupport size={20} />
                                </span>
                                <span className="ml-3">Hỗ trợ</span>
                            </div>
                        </div>

                        {/* Admin Navigation */}
                        {user?.role === 'WEBMASTER' && (
                            <div
                                onClick={() => navigate('/admin/overview')}
                                className="flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-600 hover:bg-gray-50"
                            >
                                <span className="flex items-center justify-center w-6 h-6">
                                    <GrNavigate size={20} />
                                </span>
                                <span className="ml-3">Đến trang quản trị</span>
                            </div>
                        )}

                        {/* Logout Button */}
                        <div
                            onClick={handleLogoutClick}
                            className="flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-red-600 hover:bg-red-50 mt-8"
                        >
                            <span className="flex items-center justify-center w-6 h-6">
                                <CiLogout size={20} />
                            </span>
                            <span className="ml-3">Đăng xuất</span>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default memo(SidebarUser);
