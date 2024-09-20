import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import UpdatePost from '../UpdatePost';
import { MdDelete } from 'react-icons/md';
import { RiEditFill } from 'react-icons/ri';
import { BiSolidHide } from 'react-icons/bi';

const ManagePost = () => {
    const [posts, setPosts] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [filterStatus, setFilterStatus] = useState(''); // Lưu trữ trạng thái lọc

    useEffect(() => {
        // Fetch the posts when the component mounts
        const fetchPosts = async () => {
            try {
                const response = await authApi().get(endpoints.mypost);
                setPosts(response.data); // Assuming the API returns a list of posts
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        };
        fetchPosts();
    }, []);

    const getStatus = (isActive, isApproved) => {
        if (isActive && !isApproved) return 'Chờ duyệt';
        if (!isActive) return 'Đã ẩn';
        if (isActive && isApproved) return 'Đang hoạt động';
        return '';
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
        const status = getStatus(post?.is_active, post?.is_approved);

        if (filterStatus === '') return true;

        return status === filterStatus;
    });

    return (
        <div className="px-4 py-6">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-medium">Quản lý tin đăng</h1>
                <select
                    className="outline-none border border-gray-300 p-2 rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>

                    <option value="Đã ẩn">Đã ẩn</option>
                </select>
            </div>
            <table className="w-full table-auto border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-blue-500 text-white">
                        <th className="p-2 border">Mã Tin</th>
                        <th className="p-2 border">Ảnh đại diện</th>
                        <th className="p-2 border">Tiêu đề</th>
                        <th className="p-2 border">Giá</th>
                        <th className="p-2 border">Ngày bắt đầu</th>
                        <th className="p-2 border">Ngày hết hạn</th>
                        <th className="p-2 border">Trạng thái</th>
                        <th className="p-2 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <tr key={post.id} className="text-center">
                                <td className="p-2 border">#{post.id}</td>
                                <td className="p-2 border">
                                    <img
                                        src={post?.images[0]?.url}
                                        alt={post?.title}
                                        className="w-16 h-16 object-cover rounded-md mx-auto"
                                    />
                                </td>
                                <td className="p-2 border">
                                    {post?.title?.length > 20 ? `${post?.title.slice(0, 20)}...` : post?.title}
                                </td>
                                <td className="p-2 border">{post?.room?.price} triệu/tháng</td>
                                <td className="p-2 border">{formatDate(post?.created_at)}</td>
                                <td className="p-2 border">{calculateEndDate(post?.created_at)}</td>
                                <td className="p-2 border">{getStatus(post?.is_active, post?.is_approved)}</td>
                                <td className="p-2 border">
                                    <button className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                                        <RiEditFill size={15} />
                                    </button>
                                    <button className="bg-red-500 text-white px-4 py-2 rounded mr-2">
                                        <MdDelete size={15} />
                                    </button>
                                    <button className="bg-yellow-500 text-white px-4 py-2 rounded">
                                        <BiSolidHide size={15} />
                                    </button>
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
            <UpdatePost />
        </div>
    );
};

export default ManagePost;
