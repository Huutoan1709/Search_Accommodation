import React, { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../API';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import { BiSearch, BiDotsHorizontalRounded } from 'react-icons/bi';
import { notifySuccess } from '../../components/ToastManager';
import AdminDetailPost from './AdminDetailPost';
import PaginationUser from '../../components/PaginationUser';

// Add getStatus helper function at the top of the component
const getStatus = (isApproved, isPaid) => {
    if (!isPaid) return 'Chưa thanh toán';
    if (!isApproved) return 'Chờ duyệt';
    return 'Đã duyệt';
};

const ApprovedPost = ({ post }) => {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedPosts, setSelectedPosts] = useState(new Set());
    const [selectedPost, setSelectedPost] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    const fetchApprovedPosts = async () => {
        try {
            const response = await authApi().get(endpoints.wait_post);
            setPosts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            setPosts([]);
        }
    };

    useEffect(() => {
        fetchApprovedPosts();
    }, []);

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

    const handleApproved = async (postId) => {
        const confirmApprove = window.confirm('Duyệt tin đăng. Bạn chắc chắn chứ?');
        if (confirmApprove) {
            try {
                await authApi().patch(endpoints.updatepost(postId), { is_approved: true });
                notifySuccess('Đã duyệt bài đăng');
                fetchApprovedPosts();
            } catch (error) {
                console.error('Failed to approve post:', error);
            }
        }
    };

    const handleBulkApprove = async () => {
        if (selectedPosts.size === 0) {
            alert('Vui lòng chọn ít nhất một bài đăng để duyệt.');
            return;
        }

        const confirmApprove = window.confirm('Duyệt các bài đăng đã chọn. Bạn chắc chắn chứ?');

        if (confirmApprove) {
            try {
                for (const postId of selectedPosts) {
                    await authApi().patch(endpoints.updatepost(postId), { is_approved: true });
                }
                notifySuccess('Đã duyệt tất cả bài đăng đã chọn');
                fetchApprovedPosts();
                setSelectedPosts(new Set());
            } catch (error) {
                console.error('Failed to approve posts:', error);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedPosts.size === 0) {
            alert('Vui lòng chọn ít nhất một bài đăng để xóa.');
            return;
        }

        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedPosts.size} bài đăng đã chọn không?`);

        if (confirmDelete) {
            try {
                for (const postId of selectedPosts) {
                    await authApi().delete(endpoints.deletepost(postId));
                }
                notifySuccess('Đã xóa tất cả bài đăng đã chọn');
                fetchApprovedPosts();
                setSelectedPosts(new Set());
            } catch (error) {
                console.error('Failed to delete posts:', error);
            }
        }
    };

    const truncateTitle = (title, maxLength) => {
        return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
    };

    const filteredPosts = posts.filter((post) => {
        const matchSearch =
            post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.id?.toString().includes(searchTerm) ||
            post.room?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.room?.room_type?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchSearch;
    });

    const togglePostSelection = (postId) => {
        const newSelectedPosts = new Set(selectedPosts);
        if (newSelectedPosts.has(postId)) {
            newSelectedPosts.delete(postId);
        } else {
            newSelectedPosts.add(postId);
        }
        setSelectedPosts(newSelectedPosts);
    };
    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    const closeDetailPost = () => {
        setSelectedPost(null);
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý bài đăng chờ duyệt</h1>
                <p className="text-gray-600 mt-2">Quản lý và duyệt các bài đăng trong hệ thống</p>
            </div>

            {/* Search and Actions Bar */}
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
                        <button
                            onClick={handleBulkDelete}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                            disabled={selectedPosts.size === 0}
                        >
                            <span>Xóa đã chọn</span>
                            <span className="bg-red-400 px-2 py-1 rounded-full text-sm">
                                {selectedPosts.size}
                            </span>
                        </button>
                        <button
                            onClick={handleBulkApprove}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                            disabled={selectedPosts.size === 0}
                        >
                            <span>Duyệt đã chọn</span>
                            <span className="bg-green-400 px-2 py-1 rounded-full text-sm">
                                {selectedPosts.size}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedPosts(new Set(posts.map((post) => post.id)));
                                        } else {
                                            setSelectedPosts(new Set());
                                        }
                                    }}
                                    checked={selectedPosts.size === posts.length}
                                />
                            </th>
                            <th className="px-6 py-4">Mã Tin</th>
                            <th className="px-6 py-4">Loại phòng</th>
                            <th className="px-6 py-4">Hình ảnh</th>
                            <th className="px-6 py-4">Tiêu đề</th>
                            <th className="px-6 py-4">Người đăng</th>
                            <th className="px-6 py-4">Giá(triệu)</th>
                            <th className="px-6 py-4">Diện tích(m²)</th>
                            <th className="px-6 py-4">Ngày đăng</th>
                            <th className="px-6 py-4">Loại tin</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Tùy chọn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentPosts.length > 0 ? (
                            currentPosts.map((post) => (
                                <tr 
                                    key={post.id} 
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedPosts.has(post.id)}
                                            onChange={() => togglePostSelection(post.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4" onClick={() => handlePostClick(post)}>
                                        #{post.id}
                                    </td>
                                    <td className="px-6 py-4" onClick={() => handlePostClick(post)}>
                                        {post?.room?.room_type?.name}
                                    </td>
                                    <td className="px-6 py-4" onClick={() => handlePostClick(post)}>
                                        <img
                                            src={post.images[0]?.url}
                                            alt=""
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    </td>
                                    <td className="px-6 py-4 max-w-xs" onClick={() => handlePostClick(post)}>
                                        <p className="truncate">{post.title}</p>
                                    </td>
                                    <td className="px-6 py-4" onClick={() => handlePostClick(post)}>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={post.user?.avatar}
                                                alt=""
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span>{post.user?.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4" onClick={() => handlePostClick(post)}>{post.room?.price}</td>
                                    <td className="px-6 py-4" onClick={() => handlePostClick(post)}>{post.room?.area}</td>
                                    <td className="px-6 py-4" onClick={() => handlePostClick(post)}>
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center w-fit
                                            ${post.post_type?.name === 'VIP' 
                                                ? 'bg-amber-100 text-amber-800 border border-amber-500' 
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {post.post_type?.name || 'Thường'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {!post.is_paid ? (
                                            // Not paid - show red status badge
                                            <span className="px-3 py-1 rounded-full text-sm font-medium inline-flex items-center w-fit bg-red-100 text-red-800">
                                                {getStatus(post.is_approved, post.is_paid)}
                                            </span>
                                        ) : !post.is_approved ? (
                                            // Paid but not approved - show clickable yellow badge
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleApproved(post.id);
                                                }}
                                                className="px-3 py-1 rounded-full text-sm font-medium inline-flex items-center w-fit 
                                                          bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                                                title="Click để duyệt bài"
                                            >
                                                <span className="flex items-center gap-1">
                                                    {getStatus(post.is_approved, post.is_paid)}
                                                    <RiEditFill size={16} />
                                                </span>
                                            </button>
                                        ) : (
                                            // Approved - show green status badge
                                            <span className="px-3 py-1 rounded-full text-sm font-medium inline-flex items-center w-fit bg-green-100 text-green-800">
                                                {getStatus(post.is_approved, post.is_paid)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === post.id ? null : post.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <BiDotsHorizontalRounded size={20} />
                                            </button>
                                            {openDropdown === post.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                                                    <ul className="py-2">
                                                        <li
                                                            onClick={() => {
                                                                handleDelete(post.id);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                                                        >
                                                            <MdDelete size={20} className="mr-2" />
                                                            Xóa
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                                    Không tìm thấy bài đăng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <PaginationUser
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* Detail Modal */}
            {selectedPost && <AdminDetailPost post={selectedPost} onClose={closeDetailPost} />}
        </div>
    );
};

export default ApprovedPost;
