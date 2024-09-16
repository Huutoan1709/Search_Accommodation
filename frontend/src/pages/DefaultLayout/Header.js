import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Logomotel from '../../assets/Logomotel.png';
import './DefaultLayout.scss';
import MyContext from '../../context/MyContext';

const Header = () => {
    const { user, logout } = useContext(MyContext) || {};
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleLogoutClick = () => {
        if (logout) logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-logo">
                <img src={Logomotel} alt="Logo" />
                <span></span>
            </div>
            <nav className="header-nav">
                <a href="#" className="active">
                    Trang Chủ
                </a>
                <a href="#">Nhà đất cho thuê</a>
                <a href="#">Tin tức</a>
                <a href="#">Thông Báo</a>
                <a href="#">Hỗ Trợ</a>
            </nav>
            <div className="header-icons">
                <button>❤</button>
                {user ? (
                    <>
                        <button className="post-button" onClick={handleLogoutClick}>
                            Đăng xuất
                        </button>
                        <button className="post-button">Chỉnh sửa hồ sơ</button>
                    </>
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
                <button className="post-button">Đăng tin</button>
            </div>
        </header>
    );
};

export default Header;
