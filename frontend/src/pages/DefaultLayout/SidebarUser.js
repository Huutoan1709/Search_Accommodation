import React, { memo, useContext } from 'react';
import MyContext from '../../context/MyContext';
import { CiLogout } from 'react-icons/ci';
import { RiLockPasswordLine } from 'react-icons/ri';
import { MdFormatListBulletedAdd } from 'react-icons/md';
import { BsHouseCheck } from 'react-icons/bs';
import { LuFileHeart } from 'react-icons/lu';
import { FaRegEdit } from 'react-icons/fa';
import { LuFileEdit } from 'react-icons/lu';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarUser = () => {
    const location = useLocation();
    const activeSection = location.pathname.split('/')[2];
    const { user, logout } = useContext(MyContext);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        if (logout) logout();
        navigate('/');
        window.location.reload();
    };

    const navigateToSection = (section) => {
        navigate(`/profile/${section}`);
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
                                {user?.first_name || 'Tên người dùng'} {user?.last_name || 'Họ'}
                            </span>
                            <small className="text-[14px]">{user?.phone || 'Số điện thoại'}</small>
                        </div>
                    </div>
                    <span className="font-medium p-2">
                        Mã thành viên: <span className="font-bold">{user?.id || 'N/A'}</span>
                    </span>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    {[
                        {
                            icon: <MdFormatListBulletedAdd size={20} />,
                            label: 'Đăng tin cho thuê',
                            section: 'createpost',
                        },
                        { icon: <LuFileEdit size={20} />, label: 'Quản lý tin đăng', section: 'managepost' },
                        { icon: <BsHouseCheck size={20} />, label: 'Quản lý phòng', section: 'manageroom' },
                        { icon: <FaRegEdit size={20} />, label: 'Sửa thông tin cá nhân', section: 'updateinfo' },
                        { icon: <RiLockPasswordLine size={20} />, label: 'Trang cá nhân', section: 'personalpage' },
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
