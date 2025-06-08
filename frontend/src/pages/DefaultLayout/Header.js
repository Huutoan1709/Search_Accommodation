import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logomotel from '../../assets/Logomotel.png';
import MyContext from '../../context/MyContext';
import { FaCaretDown } from 'react-icons/fa';
import { CiLogout } from 'react-icons/ci';
import { FaHeart } from 'react-icons/fa';
import { PiNotePencilBold } from 'react-icons/pi';
import './DefaultLayout.scss';
import { FaFileSignature } from 'react-icons/fa';
import { ImProfile } from 'react-icons/im';
import { BiSupport } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { GoCodeReview } from 'react-icons/go';
import { notifySuccess } from '../../components/ToastManager';
import { authApi, endpoints } from '../../API';

const Header = () => {
    const { user, logout, fetchUser } = useContext(MyContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [favoriteCount, setFavoriteCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchUser();
        }
    }, [fetchUser]);

    useEffect(() => {
        const getFavoriteCount = async () => {
            if (user) {
                try {
                    const res = await authApi().get(endpoints['myfavorite']);
                    setFavoriteCount(res.data.length);
                } catch (error) {
                    console.error("Error fetching favorite count:", error);
                }
            }
        };

        getFavoriteCount();
    }, [user]);

    const handleHomeClick = () => {
        navigate('/');
    };
    const handleLoginClick = () => {
        navigate('/login');
    };
    const handleRegisterClick = () => {
        navigate('/register');
    };
    const handleLogoutClick = () => {
        if (logout) logout();
        notifySuccess('Đăng xuất thành công');
        navigate('/login');
    };
    const handlecreateClick = () => {
        navigate('/profile/createpost');
    };
    const handleManagePostClick = () => {
        navigate('/profile/managepost');
    };
    const hadleUpdateProfileClick = () => {
        navigate('/profile/updateinfo');
    };
    const handleFavoritePostClick = () => {
        navigate('/favorite');
    };
    const handleToRequest = () => {
        navigate('/supportrequest');
    };
    const handleReviewClick = () => {
        navigate('/profile/myreviews');
    };
    const handlereceivedReviewClick = () => {
        navigate('/profile/receivedreviews');
    };
    const handleUserPageClick = () => {
        navigate('/profiles/current/');
    };
    const handlePhongTroClick = () => {
        navigate('/phong-tro');
    };
    const handleNhaNguyenCanClick = () => {
        navigate('/nha-nguyen-can');
    };
    const handleChungCuClick = () => {
        navigate('/chung-cu');
    };
    const handleCHDVClick = () => {
        navigate('/can-ho-dich-vu');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <header className="header">
                 <div className="header-logo flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
                <img src={Logomotel} alt="Logo" className="w-15 h-15 object-cover rounded-full shadow-lg" />
                <span className="font-bold text-2xl tracking-wide text-gray-800">TO_ACCOMMODATION</span>
            </div>
            <nav className="header-nav">
                <span className={`cursor-pointer ${isActive('/')}`} onClick={handleHomeClick}>
                    Trang Chủ
                </span>
                <span className={`cursor-pointer ${isActive('/phong-tro')}`} onClick={handlePhongTroClick}>
                    Phòng Trọ
                </span>
                <span className={`cursor-pointer ${isActive('/nha-nguyen-can')}`} onClick={handleNhaNguyenCanClick}>
                    Nhà nguyên căn
                </span>
                <span className={`cursor-pointer ${isActive('/chung-cu')}`} onClick={handleChungCuClick}>
                    Chung Cư
                </span>
                <span className={`cursor-pointer ${isActive('/can-ho-dich-vu')}`} onClick={handleCHDVClick}>
                    Căn hộ dịch vụ
                </span>
                <span className={`cursor-pointer ${isActive('/supportrequest')}`} onClick={handleToRequest}>
                    Hỗ Trợ
                </span>
            </nav>
            <div className=" flex gap-8 items-center">
            <div className="relative inline-block">
                <button 
                    onClick={handleFavoritePostClick}
                    className="p-2.5 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 
                    transition-all duration-300 ease-in-out transform hover:scale-110 
                    focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                >
                    <FaHeart className="w-8 h-8" />
                    {favoriteCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-2xl 
                        font-medium px-2 py-1 rounded-full min-w-[20px] h-[20px] flex items-center 
                        justify-center transform scale-100 animate-bounce
                        shadow-lg shadow-red-200 border border-white">
                            {favoriteCount}
                        </span>
                    )}
                </button>
            </div>
                {user ? (
                    <div className="user-dropdown">
                        <div className="user-info">
                            <img src={user.avatar || 'default-avatar.png'} alt="Avatar" className="avatar " />
                            <span className="user-name">
                                {user.first_name} {user.last_name}
                            </span>
                            <FaCaretDown className="dropdown-icon" />
                        </div>

                        <div className="user-menu rounded-md">
                            {user.role === 'LANDLORD' && (
                                <>
                                    <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                        <PiNotePencilBold size={20} className="text-fuchsia-500" />
                                        <span onClick={handlecreateClick}>Đăng tin cho thuê</span>
                                    </div>
                                    <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                        <FaFileSignature size={20} className="text-green-500" />
                                        <span onClick={handleManagePostClick}>Quản lý tin đăng</span>
                                    </div>
                                    <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                        <GoCodeReview size={20} className="text-yellow-500" />
                                        <span onClick={handlereceivedReviewClick}>Xem đánh giá</span>
                                    </div>
                                    <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                        <ImProfile size={20} className="text-emerald-600 " />
                                        <span onClick={handleUserPageClick}>Trang cá nhân</span>
                                    </div>
                                </>
                            )}
                            {user.role === 'CUSTOMER' && (
                                <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                    <GoCodeReview size={20} className="text-green-500" />
                                    <span onClick={handleReviewClick}>Đánh giá từ tôi</span>
                                </div>
                            )}
                            <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                <FaHeart size={20} className="text-red-500" />
                                <span onClick={handleFavoritePostClick}>Tin yêu thích</span>
                            </div>
                            <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                <CgProfile size={20} className="text-teal-400" />
                                <span onClick={hadleUpdateProfileClick}>Thông tin cá nhân</span>
                            </div>
                            <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                <BiSupport size={20} className="text-sky-600" />
                                <span onClick={handleToRequest}>Hỗ trợ</span>
                            </div>

                            <div className="flex items-center cursor-pointer">
                                <CiLogout size={20} />
                                <span onClick={handleLogoutClick}>Đăng xuất</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleLoginClick}
                            className="px-6 py-5 text-red-500 font-semibold rounded-lg
                            hover:bg-red-50 active:bg-red-100
                            transform hover:scale-105 active:scale-95
                            transition-all duration-200
                            border-2 border-red-500
                            flex items-center gap-2"
                        >
                            <span>Đăng nhập</span>
                        </button>
                        <button 
                            onClick={handleRegisterClick}
                            className="px-6 py-5 bg-red-500 text-white font-semibold rounded-lg
                            hover:bg-red-600 active:bg-red-700
                            transform hover:scale-105 active:scale-95
                            transition-all duration-200
                            shadow-md hover:shadow-lg
                            flex items-center gap-2"
                        >
                            <span>Đăng ký</span>
                        </button>
                    </div>
                )}
                {user?.role === 'LANDLORD' && (
                    <button 
                        onClick={handlecreateClick}
                        className="px-6 py-5 bg-red-500 text-white font-semibold rounded-lg
                        hover:bg-red-600 active:bg-red-700
                        transform hover:scale-105 active:scale-95
                        transition-all duration-200
                        shadow-md hover:shadow-lg
                        flex items-center gap-2"
                    >
                        <PiNotePencilBold className="w-5 h-5" />
                        <span>Đăng tin</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
