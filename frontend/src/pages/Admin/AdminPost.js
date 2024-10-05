import React, { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../API';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import { BiSearch, BiSolidHide, BiDotsHorizontalRounded } from 'react-icons/bi';
import { notifySuccess } from '../../components/ToastManager';
import { FaLock } from 'react-icons/fa';
import PaginationUser from '../../components/PaginationUser';
import { notifyError } from '../../components/ToastManager';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AdminDetailPost from './AdminDetailPost';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminPost = ({ post }) => {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 2;
    const [selectedPost, setSelectedPost] = useState(null);
    const [postCounts, setPostCounts] = useState({
        roomType1: 0,
        roomType2: 0,
        roomType3: 0,
        roomType4: 0,
    });
    useEffect(() => {
        const fetchPosts = async (page = 1) => {
            try {
                const response = await authApi().get(`${endpoints.post}?all=true&page=${page}&limit=${postsPerPage}`);
                const fetchedPosts = response.data.results;
                setPosts(fetchedPosts);

                const counts = {
                    roomType1: 0,
                    roomType2: 0,
                    roomType3: 0,
                    roomType4: 0,
                    activePosts: 0,
                    inactivePosts: 0,
                    blockedPosts: 0,
                };

                const userPostCounts = {};

                fetchedPosts.forEach((post) => {
                    switch (post?.room?.room_type.name) {
                        case 'Chung Cư':
                            counts.roomType1 += 1;
                            break;
                        case 'Phòng Trọ':
                            counts.roomType2 += 1;
                            break;
                        case 'Nhà nguyên căn':
                            counts.roomType3 += 1;
                            break;
                        case 'Căn hộ dịch vụ':
                            counts.roomType4 += 1;
                            break;
                        default:
                            break;
                    }

                    if (post.is_active) {
                        counts.activePosts += 1;
                    } else if (!post.is_active && !post.is_block) {
                        counts.inactivePosts += 1;
                    } else if (post.is_block) {
                        counts.blockedPosts += 1;
                    }

                    const userId = post.user?.id;
                    if (userId) {
                        userPostCounts[userId] = (userPostCounts[userId] || 0) + 1;
                    }
                });

                setPostCounts(counts);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                notifyError('Failed to fetch posts. Please try again later.');
            }
        };
        fetchPosts();
    }, []);
    const filteredPosts = posts.filter((post) => {
        const status = post.is_block ? 'Đã khóa' : post.is_active ? 'Đang hoạt động' : 'Đã ẩn';
        const matchSearch =
            post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.id?.toString().includes(searchTerm) ||
            post.room?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.room?.room_type?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || status === filterStatus;

        return matchesStatus && matchSearch;
    });

    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    const sortedPosts = filteredPosts.sort((a, b) => {
        let comparison = 0;

        if (sortField === 'price') {
            comparison = a.room.price - b.room.price;
        } else if (sortField === 'area') {
            comparison = a.room.area - b.room.area;
        } else if (sortField === 'date') {
            comparison = new Date(a.created_at) - new Date(b.created_at);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (postId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa bài đăng này không?');
        if (confirmDelete) {
            try {
                await authApi().delete(endpoints.deletepost(postId));
                notifySuccess('Xóa bài đăng thành công');
                setPosts(posts.filter((post) => post.id !== postId));
            } catch (error) {
                console.error('Failed to delete post:', error);
            }
        }
    };

    const handleHide = async (postId) => {
        const confirmHide = window.confirm('Bạn có chắc chắn muốn ẩn bài đăng này không?');
        if (confirmHide) {
            try {
                await authApi().patch(endpoints.updatepost(postId), { is_active: false });
                notifySuccess('Đã ẩn bài đăng');
                setPosts(posts.map((post) => (post.id === postId ? { ...post, is_active: false } : post)));
            } catch (error) {
                console.error('Failed to hide post:', error);
            }
        }
    };

    const handleLock = async (postId) => {
        const confirmLock = window.confirm('Bạn có chắc chắn muốn khóa bài đăng này không?');
        if (confirmLock) {
            try {
                await authApi().patch(endpoints.updatepost(postId), { is_block: true });
                notifySuccess('Đã khóa bài đăng');
                setPosts(posts.map((post) => (post.id === postId ? { ...post, is_block: true } : post)));
            } catch (error) {
                console.error('Failed to lock post:', error);
            }
        }
    };

    const handleUnhide = async (postId) => {
        const confirmUnhide = window.confirm('Bạn có chắc chắn muốn mở bài đăng này không?');
        if (confirmUnhide) {
            try {
                await authApi().patch(endpoints.updatepost(postId), { is_active: true });
                notifySuccess('Đã mở bài đăng');
                setPosts(posts.map((post) => (post.id === postId ? { ...post, is_active: true } : post)));
            } catch (error) {
                console.error('Failed to unhide post:', error);
            }
        }
    };

    const handleUnlock = async (postId) => {
        const confirmUnlock = window.confirm('Bạn có chắc chắn muốn mở khóa bài đăng này không?');
        if (confirmUnlock) {
            try {
                await authApi().patch(endpoints.updatepost(postId), { is_block: false });
                notifySuccess('Đã mở khóa bài đăng');
                setPosts(posts.map((post) => (post.id === postId ? { ...post, is_block: false } : post)));
            } catch (error) {
                console.error('Failed to unlock post:', error);
            }
        }
    };

    const truncateTitle = (title, maxLength) => {
        return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
    };

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };
    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    const closeDetailPost = () => {
        setSelectedPost(null);
    };
    return (
        <div className="px-4 py-6 relative">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Quản lý bài đăng</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-8">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-xl font-semibold">Chung Cư</h3>
                    <p className="text-3xl font-bold">{postCounts.roomType1}</p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-xl font-semibold">Phòng Trọ</h3>
                    <p className="text-3xl font-bold">{postCounts.roomType2}</p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-xl font-semibold">Nhàn nguyên căn</h3>
                    <p className="text-3xl font-bold">{postCounts.roomType3}</p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-xl font-semibold">Căn hộ dịch vụ</h3>
                    <p className="text-3xl font-bold">{postCounts.roomType4}</p>
                </div>
            </div>
            <div className="pt-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Danh sách tin đăng</h1>
                <div className="flex space-x-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <BiSearch size={20} />
                        </span>
                        <input
                            type="text"
                            className="pl-10 border border-gray-300 p-2 rounded-md outline-none w-full"
                            placeholder="Tìm kiếm theo tên, ID, địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="outline-none border border-gray-300 p-2 rounded-md"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Đang hoạt động">Đang hoạt động</option>
                        <option value="Đã ẩn">Đã ẩn</option>
                        <option value="Đã khóa">Đã khóa</option>
                    </select>
                </div>
            </div>

            {/* Styled Posts Table */}
            <table className="w-full text-xl text-left text-gray-600 border border-gray-200 mt-6 ">
                <thead className="bg-[#fff] text-gray-600 uppercase text-[13px] font-base">
                    <tr>
                        <th className="p-1 border">Mã Tin</th>
                        <th className="p-1 border"> Loại phòng</th>
                        <th className="p-1 border">Hình ảnh</th>
                        <th className="p-1 border">Tiêu đề</th>
                        <th className="p-1 border">Người đăng</th>
                        <th
                            className="p-2 border cursor-pointer items-center justify-between"
                            onClick={() => toggleSort('price')}
                        >
                            Giá(triệu)
                            {sortField === 'price' && (sortOrder === 'asc' ? ' 🔼' : ' 🔽')}
                        </th>
                        <th
                            className="p-2 border cursor-pointer items-center justify-between"
                            onClick={() => toggleSort('area')}
                        >
                            Diện tích(m²)
                            {sortField === 'area' && (sortOrder === 'asc' ? ' 🔼' : ' 🔽')}
                        </th>
                        <th
                            className="p-2 border cursor-pointer items-center justify-between"
                            onClick={() => toggleSort('date')}
                        >
                            Ngày đăng
                            {sortField === 'date' && (sortOrder === 'asc' ? ' 🔼' : ' 🔽')}
                        </th>
                        <th className="p-2 border">Trạng thái</th>
                        <th className="p-2 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedPosts.length > 0 ? (
                        sortedPosts.map((post, index) => (
                            <tr
                                key={post.id}
                                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} text-center text-[14px]`}
                            >
                                <td className="p-2 border cursor-pointer" onClick={() => handlePostClick(post)}>
                                    #{post.id}
                                </td>
                                <td className="p-2 border cursor-pointer" onClick={() => handlePostClick(post)}>
                                    {post?.room?.room_type?.name}
                                </td>
                                <td className="p-2 border cursor-pointer" onClick={() => handlePostClick(post)}>
                                    <img
                                        src={post.images[0]?.url}
                                        alt={post.user?.username}
                                        className="w-16 h-16 object-cover rounded-md mx-auto"
                                    />
                                </td>
                                <td className="p-2 border cursor-pointer" onClick={() => handlePostClick(post)}>
                                    {truncateTitle(post?.title, 40)}
                                </td>
                                <td className="p-2 border">
                                    <div className="flex items-center justify-center">
                                        <img
                                            src={post.user?.avatar}
                                            alt={post.user?.username}
                                            className="w-10 h-10 object-cover rounded-full"
                                        />
                                        <span>{post.user?.last_name}</span>
                                    </div>
                                </td>
                                <td className="p-2 border">{post.room?.price}</td>
                                <td className="p-2 border">{post.room?.area}</td>
                                <td className="p-2 border">{new Date(post.created_at).toLocaleDateString()}</td>
                                <td className="p-2 border">
                                    <span
                                        className={`font-semibold ${
                                            post.is_block
                                                ? 'text-red-600 border border-red-600 rounded-md p-2'
                                                : post.is_active
                                                ? 'text-green-600 border border-green-600 rounded-md p-2 '
                                                : 'text-yellow-500 border border-yellow-600 rounded-md p-2'
                                        }`}
                                    >
                                        {post.is_block ? 'Đã khóa' : post.is_active ? 'Hoạt động' : 'Đã ẩn'}
                                    </span>
                                </td>
                                <td className="p-2 border relative">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === post.id ? null : post.id)}
                                        className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
                                    >
                                        <BiDotsHorizontalRounded size={20} />
                                    </button>
                                    {openDropdown === post.id && (
                                        <div className="absolute right-0 z-10 bg-white border border-gray-300 rounded shadow-lg w-[70px]">
                                            {/* Dropdown Options */}
                                            <ul className="py-2">
                                                {post.is_active ? (
                                                    <li
                                                        onClick={() => {
                                                            handleHide(post.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <BiSolidHide size={15} className="mr-2" />
                                                        Ẩn
                                                    </li>
                                                ) : (
                                                    <li
                                                        onClick={() => {
                                                            handleUnhide(post.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <BiSolidHide size={15} className="mr-2" />
                                                        Hiện
                                                    </li>
                                                )}
                                                {post.is_block ? (
                                                    <li
                                                        onClick={() => {
                                                            handleUnlock(post.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <FaLock size={15} className="mr-2" />
                                                        Mở
                                                    </li>
                                                ) : (
                                                    <li
                                                        onClick={() => {
                                                            handleLock(post.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <FaLock size={15} className="mr-2" />
                                                        Khóa
                                                    </li>
                                                )}
                                                <li
                                                    onClick={() => {
                                                        handleDelete(post.id);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <MdDelete size={15} className="mr-2" />
                                                    Xóa
                                                </li>
                                                <li
                                                    onClick={() => {
                                                        console.log('Chỉnh sửa bài đăng với ID:', post.id);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <RiEditFill size={15} className="mr-2" />
                                                    Sửa
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="p-4 text-center">
                                Chưa có bài đăng nào...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* AdminDetailPost Component */}
            {selectedPost && <AdminDetailPost post={selectedPost} onClose={closeDetailPost} />}
            {/* <PaginationUser currentPage={currentPosts} totalPages={totalPages} onPageChange={handlePageChange} /> */}
        </div>
    );
};

export default AdminPost;
