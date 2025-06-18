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
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';

const Header = () => {
    const { user, logout, fetchUser } = useContext(MyContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserActionsOpen, setIsUserActionsOpen] = useState(false);

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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleUserActions = () => {
        setIsUserActionsOpen(!isUserActionsOpen);
    };

    return (
        <header className="header">
            <div className="flex items-center justify-between w-full lg:w-auto">
                {/* Logo section */}
                <div className="header-logo flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
                    <img src={Logomotel} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-full shadow-lg" />
                    <span className="font-bold text-base md:text-xl tracking-wide text-gray-800">TO_ACCOMMODATION</span>
                </div>

                {/* Mobile actions */}
                <div className="flex items-center gap-3 lg:hidden">
                    {/* Favorite icon */}
                    <button 
                        onClick={handleFavoritePostClick}
                        className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 
                                 transition-all duration-300 relative"
                    >
                        <FaHeart className="w-6 h-6" />
                        {favoriteCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                                         font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] 
                                         flex items-center justify-center">
                                {favoriteCount}
                            </span>
                        )}
                    </button>

                    {/* User Avatar & Actions Menu */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={toggleUserActions}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <img 
                                    src={user.avatar || 'default-avatar.png'} 
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                />
                            </button>

                            {/* User Actions Dropdown */}
                            {isUserActionsOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 bg-black/50 z-40"
                                        onClick={toggleUserActions}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg z-50 
                                                  border border-gray-200 overflow-hidden">
                                        {/* User Info */}
                                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={user.avatar || 'default-avatar.png'} 
                                                    alt="Avatar"
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                />
                                                <div>
                                                    <div className="font-semibold text-gray-800">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.role === 'LANDLORD' ? 'Chủ trọ' : 'Người thuê'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions List */}
                                        <div className="py-2">
                                            {user.role === 'LANDLORD' && (
                                                <>
                                                    <button 
                                                        onClick={() => {handlecreateClick(); toggleUserActions();}}
                                                        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
                                                    >
                                                        <PiNotePencilBold className="w-5 h-5 text-fuchsia-500" />
                                                        <span>Đăng tin cho thuê</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {handleManagePostClick(); toggleUserActions();}}
                                                        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
                                                    >
                                                        <FaFileSignature className="w-5 h-5 text-green-500" />
                                                        <span>Quản lý tin đăng</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {handlereceivedReviewClick(); toggleUserActions();}}
                                                        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
                                                    >
                                                        <GoCodeReview className="w-5 h-5 text-yellow-500" />
                                                        <span>Xem đánh giá</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {handleUserPageClick(); toggleUserActions();}}
                                                        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
                                                    >
                                                        <ImProfile className="w-5 h-5 text-emerald-600" />
                                                        <span>Trang cá nhân</span>
                                                    </button>
                                                </>
                                            )}
                                            {user.role === 'CUSTOMER' && (
                                                <button 
                                                    onClick={() => {handleReviewClick(); toggleUserActions();}}
                                                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
                                                >
                                                    <GoCodeReview className="w-5 h-5 text-green-500" />
                                                    <span>Đánh giá từ tôi</span>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => {handleFavoritePostClick(); toggleUserActions();}}
                                                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
                                            >
                                                <FaHeart className="w-5 h-5 text-red-500" />
                                                <span>Tin yêu thích</span>
                                            </button>
                                            <button 
                                                onClick={() => {hadleUpdateProfileClick(); toggleUserActions();}}
                                                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
                                            >
                                                <CgProfile className="w-5 h-5 text-teal-400" />
                                                <span>Thông tin cá nhân</span>
                                            </button>
                                            <button 
                                                onClick={() => {handleToRequest(); toggleUserActions();}}
                                                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50"
                                            >
                                                <BiSupport className="w-5 h-5 text-sky-600" />
                                                <span>Hỗ trợ</span>
                                            </button>

                                            {/* Logout Button */}
                                            <div className="border-t border-gray-200 mt-2">
                                                <button 
                                                    onClick={() => {handleLogoutClick(); toggleUserActions();}}
                                                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 text-red-500"
                                                >
                                                    <CiLogout className="w-5 h-5" />
                                                    <span>Đăng xuất</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleLoginClick}
                            className="px-3 py-1.5 text-sm text-red-500 font-semibold rounded-lg
                                     border border-red-500 hover:bg-red-50"
                        >
                            Đăng nhập
                        </button>
                    )}

                    {/* Mobile menu button */}
                    <button 
                        className="p-2 rounded-md hover:bg-gray-100"
                        onClick={toggleMobileMenu}
                    >
                        <RiMenu3Line className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex header-nav">
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

            {/* Mobile Navigation */}
            <div className={`
                lg:hidden fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-4 border-b">
                        <span className="font-bold text-xl">Menu</span>
                        <button onClick={toggleMobileMenu}>
                            <RiCloseLine className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex flex-col p-4 space-y-4">
                        <span className={`block py-2 ${isActive('/')}`} onClick={() => {handleHomeClick(); toggleMobileMenu();}}>
                            Trang Chủ
                        </span>
                        <span className={`block py-2 ${isActive('/phong-tro')}`} onClick={() => {handlePhongTroClick(); toggleMobileMenu();}}>
                            Phòng Trọ
                        </span>
                        <span className={`block py-2 ${isActive('/nha-nguyen-can')}`} onClick={() => {handleNhaNguyenCanClick(); toggleMobileMenu();}}>
                            Nhà nguyên căn
                        </span>
                        <span className={`block py-2 ${isActive('/chung-cu')}`} onClick={() => {handleChungCuClick(); toggleMobileMenu();}}>
                            Chung Cư
                        </span>
                        <span className={`block py-2 ${isActive('/can-ho-dich-vu')}`} onClick={() => {handleCHDVClick(); toggleMobileMenu();}}>
                            Căn hộ dịch vụ
                        </span>
                        <span className={`block py-2 ${isActive('/supportrequest')}`} onClick={() => {handleToRequest(); toggleMobileMenu();}}>
                            Hỗ Trợ
                        </span>
                    </nav>

                    <div className="mt-auto p-4 border-t">
                        {user ? (
                            <div className="flex flex-col space-y-4">
                                <div className="flex items-center space-x-3">
                                    <img src={user.avatar || 'default-avatar.png'} alt="Avatar" 
                                        className="w-10 h-10 rounded-full" />
                                    <span className="font-medium">{user.first_name} {user.last_name}</span>
                                </div>
                                {user.role === 'LANDLORD' && (
                                    <>
                                        <button onClick={() => {handlecreateClick(); toggleMobileMenu();}}
                                            className="flex items-center space-x-2 py-2">
                                            <PiNotePencilBold className="w-5 h-5" />
                                            <span>Đăng tin cho thuê</span>
                                        </button>
                                        <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                            <FaFileSignature size={20} className="text-green-500" />
                                            <span onClick={() => {handleManagePostClick(); toggleMobileMenu();}}>Quản lý tin đăng</span>
                                        </div>
                                        <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                            <GoCodeReview size={20} className="text-yellow-500" />
                                            <span onClick={() => {handlereceivedReviewClick(); toggleMobileMenu();}}>Xem đánh giá</span>
                                        </div>
                                        <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                            <ImProfile size={20} className="text-emerald-600 " />
                                            <span onClick={() => {handleUserPageClick(); toggleMobileMenu();}}>Trang cá nhân</span>
                                        </div>
                                    </>
                                )}
                                {user.role === 'CUSTOMER' && (
                                    <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                        <GoCodeReview size={20} className="text-green-500" />
                                        <span onClick={() => {handleReviewClick(); toggleMobileMenu();}}>Đánh giá từ tôi</span>
                                    </div>
                                )}
                                <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                    <FaHeart size={20} className="text-red-500" />
                                    <span onClick={() => {handleFavoritePostClick(); toggleMobileMenu();}}>Tin yêu thích</span>
                                </div>
                                <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                    <CgProfile size={20} className="text-teal-400" />
                                    <span onClick={() => {hadleUpdateProfileClick(); toggleMobileMenu();}}>Thông tin cá nhân</span>
                                </div>
                                <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                    <BiSupport size={20} className="text-sky-600" />
                                    <span onClick={() => {handleToRequest(); toggleMobileMenu();}}>Hỗ trợ</span>
                                </div>
                                <button onClick={() => {handleLogoutClick(); toggleMobileMenu();}}
                                    className="flex items-center space-x-2 py-2 text-red-500">
                                    <CiLogout className="w-5 h-5" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-3">
                                <button onClick={() => {handleLoginClick(); toggleMobileMenu();}}
                                    className="w-full py-2 px-4 border border-red-500 text-red-500 rounded-lg">
                                    Đăng nhập
                                </button>
                                <button onClick={() => {handleRegisterClick(); toggleMobileMenu();}}
                                    className="w-full py-2 px-4 bg-red-500 text-white rounded-lg">
                                    Đăng ký
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex gap-8 items-center">
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
