import React, { useContext, useEffect } from 'react';
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

const Header = () => {
    const { user, logout, fetchUser } = useContext(MyContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            fetchUser();
        }
    }, [fetchUser]);

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
                <img src={Logomotel} alt="Logo" className="w-12 h-12 object-cover rounded-md shadow-lg" />
                <span className="font-bold text-2xl tracking-wide text-gray-800">TOA_ACCOMMODATION</span>
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
            <div className="header-icons mx-2">
                <button className="border-r-2" onClick={handleFavoritePostClick}>
                    <FaHeart />
                </button>
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
                    <>
                        <button className="post-button" onClick={handleLoginClick}>
                            Đăng nhập
                        </button>
                        <button className="post-button" onClick={handleRegisterClick}>
                            Đăng ký
                        </button>
                    </>
                )}
                {user?.role === 'LANDLORD' && (
                    <button className="post-buttons" onClick={handlecreateClick}>
                        Đăng tin
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
