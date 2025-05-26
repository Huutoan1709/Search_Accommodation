import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import UpdatePost from '../UpdatePost';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import { BiSolidHide, BiShow, BiTime } from 'react-icons/bi';
import { notifySuccess, notifyWarning, notifyError } from '../../../components/ToastManager';
import PaginationUser from '../../../components/PaginationUser';
import PostDetailModal from './PostDetailModal';
import { removeVietnameseTones } from '../../../utils/stringUtils';
import { useNavigate } from 'react-router-dom';
import ExpiredPostsModal from '../../../components/ExpiredPostsModal';
import { MdWarning } from 'react-icons/md';

const ManagePost = () => {
    const [posts, setPosts] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPostType, setFilterPostType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showExpiredModal, setShowExpiredModal] = useState(false);
    const [expiredPosts, setExpiredPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await authApi().get(endpoints.mypost);
                setPosts(response.data);
                
                // Lọc ra các bài đăng đã hết hạn
                const expired = response.data.filter(post => 
                    post.is_paid && new Date(post.expires_at) < new Date()
                );
                
                if (expired.length > 0) {
                    setExpiredPosts(expired);
                    setShowExpiredModal(true);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        };
        fetchPosts();
    }, []);

    const getStatus = (isActive, isApproved, isBlock, isPaid, isExpired) => {
        // Kiểm tra thanh toán trước
        if (!isPaid) return 'Chưa thanh toán';

        // Kiểm tra các trạng thái theo thứ tự ưu tiên
        if (isBlock) return 'Đã khóa';
        if (isExpired) return 'Hết hạn';
        if (!isActive) return 'Đã ẩn';
        if (!isApproved) return 'Chờ duyệt';
        if (isActive && isApproved && !isBlock) return 'Hoạt động';
        
        return ''; // Trường hợp mặc định
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const filteredPosts = posts.filter((post) => {
        const status = getStatus(post?.is_active, post?.is_approved, post?.is_block, post?.is_paid, post?.is_expired);
        const matchesStatus = filterStatus === '' || status === filterStatus;
        const matchesPostType = filterPostType === '' || post?.post_type?.name === filterPostType;
        const searchTermNormalized = removeVietnameseTones(searchTerm);
        const titleNormalized = removeVietnameseTones(post.title);
        const matchesSearch = 
            post.id.toString().includes(searchTerm) ||
            titleNormalized.includes(searchTermNormalized) ||
            post.room.price.toString().includes(searchTerm);
        return matchesStatus && matchesSearch && matchesPostType;
    });

    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

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

    const handleShow = async (postId) => {
        const confirmShow = window.confirm('Bạn có chắc chắn muốn hiện bài đăng này không?');
        if (confirmShow) {
            try {
                await authApi().patch(endpoints.updatepost(postId), { is_active: true });
                notifySuccess('Đã hiện bài đăng');
                setPosts(posts.map((post) => (post.id === postId ? { ...post, is_active: true } : post)));
            } catch (error) {
                console.error('Failed to show post:', error);
            }
        }
    };

    const handlePaymentRedirect = async (postId, postType) => {
        try {
            const response = await authApi().post(endpoints.paymentcreate, {
                post_id: postId,
                post_type_id: postType.id,
                amount: postType.price,
            });
            
            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                notifyError('Không thể tạo URL thanh toán');
            }
        } catch (error) {
            notifyError('Có lỗi xảy ra khi tạo thanh toán');
        }
    };

    // Thêm hàm xử lý gia hạn
    const handleRenewal = async (postId, postType) => {
        try {
            const response = await authApi().post(endpoints.paymentcreate, {
                post_id: postId,
                post_type_id: postType.id,
                amount: postType.price,
                is_renewal: true // Thêm flag để backend biết đây là gia hạn
            });
            
            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                notifyError('Không thể tạo URL thanh toán gia hạn');
            }
        } catch (error) {
            notifyError('Có lỗi xảy ra khi tạo yêu cầu gia hạn');
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const handleFilterChange = (newFilter) => {
        setFilterStatus(newFilter);
        setCurrentPage(1);
    };

    const handlePostTypeFilterChange = (newFilter) => {
        setFilterPostType(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        setCurrentPage(1);
    };
    const handleEdit = (post) => {
        setSelectedPost(post);
        setIsUpdateOpen(true);
    };

    const handleUpdate = (updatedPost) => {
        setPosts(posts.map((post) => (post.id === selectedPost.id ? { ...post, ...updatedPost } : post)));
        setIsUpdateOpen(false);
        setSelectedPost(null);
    };

    const handlePostClick = (post) => {
        setSelectedPost(post);
        setShowDetailModal(true);
    };
    return (
        <div className="px-6 py-8 min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </span>
                        <span className='text-2xl'>Quản lý tin đăng</span>
                        <span className="text-2xl font-normal text-gray-500">({totalPosts} tin)</span>
                        {expiredPosts.length > 0 && (
                            <button
                                onClick={() => setShowExpiredModal(true)}
                                className="ml-4 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
                                title="Xem tin đăng hết hạn"
                            >
                                <MdWarning className="text-xl" />
                                <span className="text-sm font-medium">{expiredPosts.length} tin hết hạn</span>
                            </button>
                        )}
                    </h1>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm tin đăng..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                            <svg className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <select
                            className="w-full md:w-48 py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            value={filterStatus}
                            onChange={(e) => handleFilterChange(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Hoạt động">Hoạt động</option>
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <option value="Đã ẩn">Đã ẩn</option>
                            <option value="Đã khóa">Đã khóa</option>
                            <option value="Hết hạn">Hết hạn</option>
                            <option value="Chưa thanh toán">Chưa thanh toán</option>
                        </select>

                        <select
                            className="w-full md:w-48 py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            value={filterPostType}
                            onChange={(e) => handlePostTypeFilterChange(e.target.value)}
                        >
                            <option value="">Tất cả loại tin</option>
                            <option value="VIP">VIP</option>
                            <option value="NORMAL">NORMAL</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Mã Tin</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Ảnh</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Tiêu đề</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Giá/tháng</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Ngày đăng</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Hết hạn</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500 w-32">Loại Tin</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Tùy chọn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentPosts.length > 0 ? (
                                currentPosts.map((post) => (
                                    <tr 
                                        key={post.id}
                                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-600">
                                            #{post.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={post?.images[0]?.url}
                                                alt={post?.title}
                                                className="h-20 w-20 rounded-lg object-cover hover:scale-150 transition-transform duration-200"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-xl text-gray-900 truncate hover:text-clip">
                                                {post?.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xl font-medium text-green-600">
                                                {post?.room?.price} triệu
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-600">
                                            {formatDate(post?.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xl">
                                            {post.is_paid ? (
                                                new Date(post.expires_at) < new Date() ? (
                                                    <span className="text-red-600 font-medium">
                                                        {formatDate(post.expires_at)}
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600">
                                                        {formatDate(post.expires_at)}
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-gray-400">
                                                    Chưa thanh toán
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap w-40"> {/* Tăng width lên w-40 */}
                                            <span className={`
                                                px-4 py-2 
                                                rounded-full 
                                                text-base 
                                                font-medium 
                                                w-full 
                                                inline-block 
                                                text-center
                                                transition-all 
                                                duration-300
                                                ${post?.post_type?.name === 'VIP' 
                                                    ? 'bg-amber-100 text-amber-800 border-2 border-amber-500 shadow-lg hover:shadow-amber-200 hover:scale-105 animate-pulse-slow' 
                                                    : 'bg-gray-100 text-gray-800'
                                                }
                                            `}>
                                                <div className="flex items-center justify-center gap-1">
                                                    {post?.post_type?.name === 'VIP' && (
                                                        <svg 
                                                            className="w-4 h-4 text-amber-600" 
                                                            fill="currentColor" 
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                        </svg>
                                                    )}
                                                    {post?.post_type?.name || 'NORMAL'}
                                                </div>
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (post?.is_expired) {
                                                            handleRenewal(post.id, post.post_type);
                                                        }
                                                    }}
                                                    className={`text-center px-2 py-2 rounded-full text-lg font-medium justify-center ${
                                                        post?.is_block ? 'bg-red-100 text-red-800' :
                                                        post?.is_expired ? 'bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer' :
                                                        !post?.is_active ? 'bg-gray-100 text-gray-800' :
                                                        !post?.is_approved ? 'bg-yellow-100 text-yellow-800' :
                                                        post?.is_paid ? 'bg-green-100 text-green-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {getStatus(
                                                        post?.is_active,
                                                        post?.is_approved,
                                                        post?.is_block,
                                                        post?.is_paid,
                                                        post?.is_expired
                                                    )}
                                                </button>

                                                {!post?.is_paid && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePaymentRedirect(post.id, post.post_type);
                                                        }}
                                                        className="text-lg py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors duration-200"
                                                    >
                                                        Thanh toán ngay
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium space-x-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(post);
                                                }}
                                                className="text-amber-600 hover:text-amber-900 transition-colors duration-200 p-2 hover:bg-amber-50 rounded-full"
                                                title="Sửa"
                                            >
                                                <RiEditFill size={24} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(post.id);
                                                }}
                                                className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 hover:bg-red-50 rounded-full"
                                                title="Xóa"
                                            >
                                                <MdDelete size={24} />
                                            </button>
                                            {post.is_active ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleHide(post.id);
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200 p-2 hover:bg-yellow-50 rounded-full"
                                                    title="Ẩn"
                                                >
                                                    <BiSolidHide size={24} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShow(post.id);
                                                    }}
                                                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                                                    title="Hiện"
                                                >
                                                    <BiShow size={24} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        Không tìm thấy tin đăng nào...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-6">
                <PaginationUser 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Modals */}
            {isUpdateOpen && (
                <UpdatePost 
                    post={selectedPost} 
                    onUpdate={handleUpdate} 
                    onClose={() => setIsUpdateOpen(false)} 
                />
            )}
            {showDetailModal && (
                <PostDetailModal 
                    post={selectedPost} 
                    onClose={() => setShowDetailModal(false)} 
                />
            )}
            <ExpiredPostsModal 
                isOpen={showExpiredModal}
                onClose={() => setShowExpiredModal(false)}
                expiredPosts={expiredPosts}
            />
        </div>
    );
};

export default ManagePost;
