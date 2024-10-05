import React, { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../API';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import { BiSearch, BiDotsHorizontalRounded } from 'react-icons/bi';
import { notifySuccess } from '../../components/ToastManager';
import AdminDetailPost from './AdminDetailPost';
const ApprovedPost = ({ post }) => {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedPosts, setSelectedPosts] = useState(new Set());
    const [selectedPost, setSelectedPost] = useState(null);

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
    return (
        <div className="px-4 py-6 relative">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Quản lý bài đăng</h1>
                <div className="flex space-x-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <BiSearch size={20} />
                        </span>
                        <input
                            type="text"
                            className="pl-10 border border-gray-300 p-2 rounded-md outline-none w-full"
                            placeholder="Tìm kiếm theo tên, ID, địa chỉ, loại phòng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleBulkApprove}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                        Duyệt hàng loạt
                    </button>
                </div>
            </div>

            <table className="w-full text-xl text-left text-gray-600 border border-gray-200 mt-6">
                <thead className="bg-gray-100 text-gray-600 uppercase text-[13px] font-semibold">
                    <tr>
                        <th className="p-2 border">
                            <input
                                type="checkbox"
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
                        <th className="p-3 border">Mã Tin</th>
                        <th className="p-3 border">Loại phòng</th>
                        <th className="p-3 border">Tiêu đề</th>
                        <th className="p-3 border">Người đăng</th>
                        <th className="p-3 border">Giá(triệu)</th>
                        <th className="p-3 border">Diện tích(m2)</th>
                        <th className="p-3 border">Ngày đăng</th>
                        <th className="p-3 border">Trạng thái</th>
                        <th className="p-3 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                            <tr key={post.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} text-center`}>
                                <td className="p-3 border">
                                    <input
                                        type="checkbox"
                                        checked={selectedPosts.has(post.id)}
                                        onChange={() => togglePostSelection(post.id)}
                                    />
                                </td>
                                <td className="p-3 border cursor-pointer" onClick={() => handlePostClick(post)}>
                                    #{post.id}
                                </td>
                                <td className="p-3 border">{post?.room?.room_type?.name}</td>
                                <td className="p-3 border">{truncateTitle(post?.title, 50)}</td>
                                <td className="p-3 border">
                                    <div className="flex items-center justify-center space-x-2">
                                        <img
                                            src={post.user?.avatar}
                                            alt={post.user?.username}
                                            className="w-10 h-10 object-cover rounded-full"
                                        />
                                        <span>{post.user?.username}</span>
                                    </div>
                                </td>
                                <td className="p-3 border">{post.room?.price}</td>
                                <td className="p-3 border">{post.room?.area}</td>
                                <td className="p-3 border">{new Date(post.created_at).toLocaleDateString()}</td>
                                <td className="p-3 border">
                                    {post.is_approved === false ? (
                                        <button
                                            onClick={() => handleApproved(post.id)}
                                            className="bg-yellow-400 text-black px-2 py-1 rounded hover:bg-yellow-500"
                                        >
                                            Chờ duyệt
                                        </button>
                                    ) : (
                                        <span className="font-semibold text-green-600">Đã duyệt</span>
                                    )}
                                </td>
                                <td className="p-3 border relative">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === post.id ? null : post.id)}
                                        className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
                                    >
                                        <BiDotsHorizontalRounded size={20} />
                                    </button>
                                    {openDropdown === post.id && (
                                        <div className="absolute right-0 z-10 bg-white border border-gray-300 rounded shadow-lg w-[100px]">
                                            <ul className="py-2">
                                                <li
                                                    onClick={() => {
                                                        handleDelete(post.id);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <MdDelete size={15} className="inline mr-2" />
                                                    Xóa
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10" className="p-3 text-center text-gray-500">
                                Không tìm thấy bài đăng nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {selectedPost && <AdminDetailPost post={selectedPost} onClose={closeDetailPost} />}
        </div>
    );
};

export default ApprovedPost;
