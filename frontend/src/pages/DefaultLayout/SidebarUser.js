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
const SidebarUser = () => {
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
        <div className="w-[256px] flex-none p-6 shadow-lg">
            <div className="fixed">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-center">
                        <img
                            src={user?.avatar || 'default-avatar.png'}
                            alt="avatar"
                            className="w-20 h-20 object-cover rounded-full border-2 border-white"
                        />
                        <div className="flex flex-col justify-center">
                            <span className="font-semibold text-[18px]">
                                {user?.first_name || 'Tên'} {user?.last_name || ''}
                            </span>
                            <small className="text-[14px]">{user?.phone || 'Số điện thoại'}</small>
                        </div>
                    </div>
                    <span className="font-medium p-2">
                        Mã thành viên: <span className="font-bold">{user?.id || 'N/A'}</span>
                    </span>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    {user?.role === 'LANDLORD' && (
                        <>
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
                            ].map((item) => (
                                <div
                                    key={item.section}
                                    className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                                        activeSection === item.section ? 'active' : ''
                                    }`}
                                    onClick={() => navigateToSection(item.section)}
                                >
                                    {item.icon}
                                    <span
                                        className={`w-full ml-3 ${
                                            activeSection === item.section ? 'font-bold' : 'font-normal'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                            <div
                                className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                                    activeSection === 'current' ? 'active' : ''
                                }`}
                                onClick={handleUserPageClick}
                            >
                                <ImProfile size={20} className="font-normal" />
                                <span
                                    className={`w-full ml-3 ${
                                        activeSection === 'current' ? 'font-bold' : 'font-normal'
                                    }`}
                                >
                                    Trang cá nhân
                                </span>
                            </div>
                        </>
                    )}
                    <div
                        className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                            activeSection === 'updateinfo' ? 'active' : ''
                        }`}
                        onClick={() => navigateToSection('updateinfo')}
                    >
                        <FaRegEdit size={20} className="font-normal" />
                        <span className={`w-full ml-3 ${activeSection === 'updateinfo' ? 'font-bold' : 'font-normal'}`}>
                            Sửa thông tin cá nhân
                        </span>
                    </div>
                    {user?.role === 'CUSTOMER' && (
                        <div
                            className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                                activeSection === 'myreviews' ? 'active' : ''
                            }`}
                            onClick={() => navigateToSection('myreviews')}
                        >
                            <GoCodeReview size={20} className="font-normal" />
                            <span
                                className={`w-full ml-3 ${activeSection === 'myreviews' ? 'font-bold' : 'font-normal'}`}
                            >
                                Quản lý đánh giá
                            </span>
                        </div>
                    )}
                    <div
                        className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                            activeSection === 'favorite' ? 'active' : ''
                        }`}
                        onClick={handleFavoritePostClick}
                    >
                        <BiHeart size={20} className="font-normal" />
                        <span className={`w-full ml-3 ${activeSection === 'favorite' ? 'font-bold' : 'font-normal'}`}>
                            Tin yêu thích
                        </span>
                    </div>
                    <div
                        className={`flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer ${
                            activeSection === 'supportrequest' ? 'active' : ''
                        }`}
                        onClick={handleToRequest}
                    >
                        <BiSupport size={20} className="font-normal" />
                        <span
                            className={`w-full ml-3 ${
                                activeSection === 'supportrequest' ? 'font-bold' : 'font-normal'
                            }`}
                        >
                            Hỗ trợ
                        </span>
                    </div>
                    {user?.role === 'WEBMASTER' && (
                        <div
                            className="flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer"
                            onClick={() => navigate('/admin/overview')}
                        >
                            <GrNavigate size={20} className="font-normal" />
                            <span className="w-full ml-3">Đến trang quản trị</span>
                        </div>
                    )}
                    <div
                        className="flex items-center hover:bg-slate-200 p-2 border-b border-gray-300 border-dashed cursor-pointer"
                        onClick={handleLogoutClick}
                    >
                        <CiLogout size={20} className="font-normal" />
                        <span className="w-full font-normal ml-3">Đăng xuất</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(SidebarUser);
