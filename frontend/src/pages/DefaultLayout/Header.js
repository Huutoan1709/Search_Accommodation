import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logomotel from '../../assets/Logomotel.png';
import MyContext from '../../context/MyContext';
import { FaCaretDown } from 'react-icons/fa';
import { CiLogout } from 'react-icons/ci';
import { FaHeart } from 'react-icons/fa';
import { PiNotePencilBold } from 'react-icons/pi';
import './DefaultLayout.scss';
import { FaFileSignature } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';

const Header = () => {
    const { user, logout, fetchUser } = useContext(MyContext);
    const navigate = useNavigate();
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
        navigate('/');
        window.location.reload();
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
    return (
        <header className="header">
            <div className="header-logo">
                <img src={Logomotel} alt="Logo" />
                <span></span>
            </div>
            <nav className="header-nav">
                <span className="active cursor-pointer" onClick={handleHomeClick}>
                    Trang Chủ
                </span>
                <span className="cursor-pointer">Phòng trọ nhà trọ</span>
                <span className="cursor-pointer">Nhà Nguyên căn</span>
                <span className="cursor-pointer">Căn hộ Mini</span>
                <span className="cursor-pointer">Căn hộ dịch vụ</span>
                <span className="cursor-pointer" onClick={handleToRequest}>
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
                            <img src={user.avatar || 'default-avatar.png'} alt="Avatar" className="avatar" />
                            <span className="user-name">
                                {user.first_name} {user.last_name}
                            </span>
                            <FaCaretDown className="dropdown-icon" />
                        </div>

                        <div className="user-menu rounded-md">
                            <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                <PiNotePencilBold size={20} className="text-blue-500" />
                                <span onClick={handlecreateClick}>Đăng tin cho thuê</span>
                            </div>
                            <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                <FaFileSignature size={20} className="text-green-500" />
                                <span onClick={handleManagePostClick}>Quản lý tin đăng</span>
                            </div>
                            <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                <FaHeart size={20} className="text-red-500" />
                                <span onClick={handleFavoritePostClick}>Tin yêu thích</span>
                            </div>
                            <div className="flex items-center cursor-pointer border-b border-gray-300 border-dashed">
                                <CgProfile size={20} className="text-yellow-500 " />
                                <span onClick={hadleUpdateProfileClick}>Thông tin cá nhân</span>
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
                <button className="post-buttons" onClick={handlecreateClick}>
                    Đăng tin
                </button>
            </div>
        </header>
    );
};

export default Header;
