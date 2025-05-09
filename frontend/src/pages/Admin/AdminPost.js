import React, { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../API';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import { BiSearch, BiSolidHide, BiDotsHorizontalRounded, BiTrendingUp, BiTrendingDown } from 'react-icons/bi';
import { notifySuccess } from '../../components/ToastManager';
import { FaLock } from 'react-icons/fa';
import PaginationUser from '../../components/PaginationUser';
import { notifyError } from '../../components/ToastManager';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AdminDetailPost from './AdminDetailPost';
import { IoHomeOutline } from 'react-icons/io5';
import { removeVietnameseTones } from '../../utils/stringUtils';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatsCard = ({ title, count, icon: Icon, color, growth }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold mt-2">{count}</p>
        {growth !== undefined && (
            <div className="flex items-center mt-2">
                {growth >= 0 ? (
                    <BiTrendingUp className="text-green-500 mr-1 text-xl" />
                ) : (
                    <BiTrendingDown className="text-red-500 mr-1 text-xl" />
                )}
                <span className={`text-base ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(growth).toFixed(1)}% so với tháng trước
                </span>
            </div>
        )}
    </div>
);

const AdminPost = () => {
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
        growthRate1: 0,
        growthRate2: 0,
        growthRate3: 0,
        growthRate4: 0,
    });
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                let allPosts = [];
                let nextUrl = `${endpoints.post}?all=true`;

                // Fetch all pages
                while (nextUrl) {
                    const response = await authApi().get(nextUrl);
                    const postData = response.data;
                    allPosts = [...allPosts, ...postData.results];
                    nextUrl = postData.next ? new URL(postData.next).pathname + new URL(postData.next).search : null;
                }
                
                setPosts(allPosts);

                // Get current month and previous month
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                // Initialize counters for total posts by room type
                const totalCountsByType = {
                    'Chung Cư': 0,
                    'Phòng Trọ': 0,
                    'Nhà nguyên căn': 0,
                    'Căn hộ dịch vụ': 0
                };

                // Count total posts by room type (all time)
                allPosts.forEach(post => {
                    const type = post?.room?.room_type?.name;
                    if (totalCountsByType.hasOwnProperty(type)) {
                        totalCountsByType[type]++;
                    }
                });

                // Filter posts for current and last month for growth calculation
                const thisMonthPosts = allPosts.filter(post => {
                    const createdDate = new Date(post.created_at);
                    return createdDate.getMonth() === currentMonth && 
                           createdDate.getFullYear() === currentYear;
                });

                const lastMonthPosts = allPosts.filter(post => {
                    const createdDate = new Date(post.created_at);
                    return createdDate.getMonth() === (currentMonth - 1) && 
                           createdDate.getFullYear() === currentYear;
                });

                // Count posts by room type for current and last month
                const currentMonthCounts = {
                    'Chung Cư': 0,
                    'Phòng Trọ': 0,
                    'Nhà nguyên căn': 0,
                    'Căn hộ dịch vụ': 0
                };

                const lastMonthCounts = {
                    'Chung Cư': 0,
                    'Phòng Trọ': 0,
                    'Nhà nguyên căn': 0,
                    'Căn hộ dịch vụ': 0
                };

                // Count posts for current month
                thisMonthPosts.forEach(post => {
                    const type = post?.room?.room_type?.name;
                    if (currentMonthCounts.hasOwnProperty(type)) {
                        currentMonthCounts[type]++;
                    }
                });

                // Count posts for last month
                lastMonthPosts.forEach(post => {
                    const type = post?.room?.room_type?.name;
                    if (lastMonthCounts.hasOwnProperty(type)) {
                        lastMonthCounts[type]++;
                    }
                });

                // Calculate growth rates
                const calculateGrowth = (current, previous) => {
                    if (previous === 0) return current > 0 ? 100 : 0;
                    return ((current - previous) / previous) * 100;
                };

                // Update state with total counts and growth rates
                setPostCounts({
                    roomType1: totalCountsByType['Chung Cư'],
                    roomType2: totalCountsByType['Phòng Trọ'],
                    roomType3: totalCountsByType['Nhà nguyên căn'],
                    roomType4: totalCountsByType['Căn hộ dịch vụ'],
                    growthRate1: calculateGrowth(currentMonthCounts['Chung Cư'], lastMonthCounts['Chung Cư']),
                    growthRate2: calculateGrowth(currentMonthCounts['Phòng Trọ'], lastMonthCounts['Phòng Trọ']),
                    growthRate3: calculateGrowth(currentMonthCounts['Nhà nguyên căn'], lastMonthCounts['Nhà nguyên căn']),
                    growthRate4: calculateGrowth(currentMonthCounts['Căn hộ dịch vụ'], lastMonthCounts['Căn hộ dịch vụ'])
                });

                // Debug logs
                console.log('All time counts:', totalCountsByType);
                console.log('Current month counts:', currentMonthCounts);
                console.log('Last month counts:', lastMonthCounts);

            } catch (error) {
                console.error('Failed to fetch posts:', error);
                notifyError('Failed to fetch posts. Please try again later.');
            }
        };
        fetchPosts();
    }, []);
    const filteredPosts = posts.filter((post) => {
        const status = post.is_block ? 'Đã khóa' : post.is_active ? 'Đang hoạt động' : 'Đã ẩn';
        const matchesStatus = filterStatus === '' || status === filterStatus;

        // Normalize search terms and content for comparison
        const searchTermNormalized = removeVietnameseTones(searchTerm.toLowerCase());
        const titleNormalized = removeVietnameseTones(post.title?.toLowerCase() || '');
        const addressNormalized = removeVietnameseTones(post.room?.address?.toLowerCase() || '');
        const roomTypeNormalized = removeVietnameseTones(post.room?.room_type?.name?.toLowerCase() || '');
        const userNameNormalized = removeVietnameseTones(post.user?.last_name?.toLowerCase() || '');

        const matchSearch =
            titleNormalized.includes(searchTermNormalized) ||
            post.id?.toString().includes(searchTerm) ||
            addressNormalized.includes(searchTermNormalized) ||
            roomTypeNormalized.includes(searchTermNormalized) ||
            userNameNormalized.includes(searchTermNormalized) ||
            post.room?.price?.toString().includes(searchTerm) ||
            post.room?.area?.toString().includes(searchTerm);

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
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý bài đăng</h1>
                <p className="text-gray-600 mt-2">Quản lý và theo dõi tất cả bài đăng trong hệ thống</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Chung Cư"
                    count={postCounts.roomType1}
                    icon={IoHomeOutline}
                    color="bg-blue-500"
                    growth={postCounts.growthRate1}
                />
                <StatsCard
                    title="Phòng Trọ"
                    count={postCounts.roomType2}
                    icon={IoHomeOutline}
                    color="bg-purple-500"
                    growth={postCounts.growthRate2}
                />
                <StatsCard
                    title="Nhà nguyên căn"
                    count={postCounts.roomType3}
                    icon={IoHomeOutline}
                    color="bg-green-500"
                    growth={postCounts.growthRate3}
                />
                <StatsCard
                    title="Căn hộ dịch vụ"
                    count={postCounts.roomType4}
                    icon={IoHomeOutline}
                    color="bg-amber-500"
                    growth={postCounts.growthRate4}
                />
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <BiSearch size={20} />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Tìm kiếm theo tên, ID, địa chỉ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <select
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Mã Tin</th>
                            <th className="px-6 py-4">Loại phòng</th>
                            <th className="px-6 py-4">Hình ảnh</th>
                            <th className="px-6 py-4">Tiêu đề</th>
                            <th className="px-6 py-4">Người đăng</th>
                            <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('date')}>
                                <div className="flex items-center">
                                    Ngày đăng
                                    {sortField === 'date' && (
                                        <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            
                            <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('price')}>
                                <div className="flex items-center">
                                    Giá(triệu)
                                    {sortField === 'price' && (
                                        <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('area')}>
                                <div className="flex items-center">
                                    Diện tích(m²)
                                    {sortField === 'area' && (
                                        <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Tùy chọn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedPosts.map((post) => (
                            <tr 
                                key={post.id} 
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => handlePostClick(post)}
                            >
                                <td className="px-6 py-4">{post.id}</td>
                                <td className="px-6 py-4">{post?.room?.room_type?.name}</td>
                                <td className="px-6 py-4">
                                    <img
                                        src={post.images[0]?.url}
                                        alt=""
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                    <p className="truncate">{post.title}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={post.user?.avatar}
                                            alt=""
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span>{post.user?.last_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {formatDate(post.created_at)}
                                </td>
                                
                                <td className="px-6 py-4">{post.room?.price}</td>
                                <td className="px-6 py-4">{post.room?.area}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xl font-medium ${
                                            post.is_block
                                                ? 'bg-red-100 text-red-800'
                                                : post.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {post.is_block ? 'Đã khóa' : post.is_active ? 'Hoạt động' : 'Đã ẩn'}
                                    </span>
                                </td>
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(openDropdown === post.id ? null : post.id);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <BiDotsHorizontalRounded size={20} />
                                        </button>
                                        {/* Dropdown Menu */}
                                        {openDropdown === post.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-2">
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
                                                    
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6">
                <PaginationUser
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Post Detail Modal */}
            {selectedPost && <AdminDetailPost post={selectedPost} onClose={closeDetailPost} />}
        </div>
    );
};

export default AdminPost;
