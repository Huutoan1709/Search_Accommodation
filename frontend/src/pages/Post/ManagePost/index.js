import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import UpdatePost from '../UpdatePost';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import { BiSolidHide, BiShow } from 'react-icons/bi';
import { notifySuccess, notifyWarning } from '../../../components/ToastManager';
import PaginationUser from '../../../components/PaginationUser';
import PostDetailModal from './PostDetailModal';

const ManagePost = () => {
    const [posts, setPosts] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await authApi().get(endpoints.mypost);
                setPosts(response.data);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        };
        fetchPosts();
    }, []);

    const getStatus = (isActive, isApproved, isBlock) => {
        if (isBlock) return 'Đã khóa';
        if (isActive && !isApproved) return 'Chờ duyệt';
        if (!isActive) return 'Đã ẩn';
        if (isActive && isApproved) return 'Hoạt động';
        return '';
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Hoạt động':
                return 'text-green-600 font-semibold';
            case 'Chờ duyệt':
                return ' text-yellow-500 font-semibold';
            case 'Đã ẩn':
                return ' text-gray-600 font-semibold';
            case 'Đã khóa':
                return ' text-red-500 font-semibold';
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const calculateEndDate = (startDate) => {
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + 1);
        return formatDate(start);
    };

    const filteredPosts = posts.filter((post) => {
        const status = getStatus(post?.is_active, post?.is_approved, post?.is_block);
        const matchesStatus = filterStatus === '' || status === filterStatus;
        const matchesSearch =
            post.id.toString().includes(searchTerm) || // Tìm kiếm theo mã tin
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) || // Tìm kiếm theo tiêu đề
            post.room.price.toString().includes(searchTerm); // Tìm kiếm theo giá

        return matchesStatus && matchesSearch;
    });
    // Phân trang
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

    // Hàm để hiện bài đăng
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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const handleFilterChange = (newFilter) => {
        setFilterStatus(newFilter);
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
        <div className="px-4 py-6 relative">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-medium">Quản lý tin đăng</h1>

                <div className="py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã tin, tiêu đề hoặc giá"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="ml-4 border border-gray-300 p-2 rounded-md h-full min-w-[200px] focus:ring focus:ring-blue-300"
                    />
                    <select
                        className="outline-none border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-300"
                        value={filterStatus}
                        onChange={(e) => handleFilterChange(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Chờ duyệt">Chờ duyệt</option>
                        <option value="Đã ẩn">Đã ẩn</option>
                        <option value="Đã khóa">Đã khóa</option>
                    </select>
                </div>
            </div>
            <table className="w-full table-auto border-collapse border border-gray-200 mt-4">
                <thead>
                    <tr className="bg-blue-500 text-white">
                        <th className="p-3 border">Mã Tin</th>
                        <th className="p-3 border">Ảnh đại diện</th>
                        <th className="p-3 border">Tiêu đề</th>
                        <th className="p-3 border">Giá(triệu)</th>
                        <th className="p-3 border">Ngày bắt đầu</th>
                        <th className="p-3 border">Ngày hết hạn</th>
                        <th className="p-3 border">Trạng thái</th>
                        <th className="p-3 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPosts.length > 0 ? (
                        currentPosts.map((post) => (
                            <tr key={post.id} className="text-center odd:bg-gray-100 even:bg-white">
                                <td className="p-3 border">#{post.id}</td>
                                <td className="p-3 border cursor-pointer" onClick={() => handlePostClick(post)}>
                                    <img
                                        src={post?.images[0]?.url}
                                        alt={post?.title}
                                        className="w-16 h-16 object-cover rounded-md mx-auto"
                                    />
                                </td>
                                <td className="p-3 border  cursor-pointer" onClick={() => handlePostClick(post)}>
                                    {post?.title?.length > 20 ? `${post?.title.slice(0, 20)}...` : post?.title}
                                </td>
                                <td className="p-3 border">{post?.room?.price}</td>
                                <td className="p-3 border">{formatDate(post?.created_at)}</td>
                                <td className="p-3 border">{calculateEndDate(post?.created_at)}</td>
                                <td
                                    className={`p-3 border ${getStatusClass(
                                        getStatus(post?.is_active, post?.is_approved, post?.is_block),
                                    )}`}
                                >
                                    {getStatus(post?.is_active, post?.is_approved, post?.is_block)}
                                </td>
                                <td className="p-3 border">
                                    <button
                                        className="bg-green-500 text-white px-3 py-2 rounded mr-2 hover:bg-green-600"
                                        title="Sửa"
                                        onClick={() => handleEdit(post)}
                                    >
                                        <RiEditFill size={15} />
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-2 rounded mr-2 hover:bg-red-600"
                                        onClick={() => handleDelete(post.id)}
                                        title="Xóa"
                                    >
                                        <MdDelete size={15} />
                                    </button>
                                    {post.is_active ? (
                                        <button
                                            className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                                            onClick={() => handleHide(post.id)}
                                            title="Ẩn"
                                        >
                                            <BiSolidHide size={15} />
                                        </button>
                                    ) : (
                                        <button
                                            className="bg-gray-400 text-black px-3 py-2 rounded hover:bg-gray-500"
                                            onClick={() => handleShow(post.id)}
                                            title="Hiện"
                                        >
                                            <BiShow size={15} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="p-4 text-center">
                                Chưa có bài đăng nào...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <PaginationUser currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            {isUpdateOpen && (
                <UpdatePost post={selectedPost} onUpdate={handleUpdate} onClose={() => setIsUpdateOpen(false)} />
            )}
            {showDetailModal && <PostDetailModal post={selectedPost} onClose={() => setShowDetailModal(false)} />}
        </div>
    );
};

export default ManagePost;
