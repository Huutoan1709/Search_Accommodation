import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logomotel from '../../assets/Logomotel.png';
import './DefaultLayout.scss';

const Header = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <header className="header">
            <div className="header-logo">
                <img src={Logomotel} alt="Logo" />
                <span></span>
            </div>
            <nav className="header-nav">
                <a href="#" className="active">
                    Phòng trọ
                </a>
                <a href="#">Nhà đất cho thuê</a>
                <a href="#">Tin tức</a>
                <a href="#">Thông Báo</a>
                <a href="#">Hỗ Trợ</a>
            </nav>
            <div className="header-icons">
                <button>❤</button>
                <button className="post-button " onClick={handleLoginClick}>
                    Đăng nhập
                </button>
                <button className="post-button" onClick={handleRegisterClick}>
                    Đăng ký
                </button>
                <button className="post-button ">Đăng tin</button>
            </div>
        </header>
    );
};

export default Header;
