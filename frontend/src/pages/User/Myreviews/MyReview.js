import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { MdEdit } from 'react-icons/md';
import PaginationUser from '../../../components/PaginationUser';
import { notifySuccess } from '../../../components/ToastManager';
import { AiFillStar } from 'react-icons/ai';

const MyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [editingReview, setEditingReview] = useState(null);
    const [editedComment, setEditedComment] = useState('');
    const [editedRating, setEditedRating] = useState(5);
    const reviewsPerPage = 10;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await authApi().get(endpoints.myreviews);
                setReviews(response.data);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            }
        };
        fetchReviews();
    }, []);

    const handleEditReview = (review) => {
        setEditingReview(review);
        setEditedComment(review.comment);
        setEditedRating(review.rating);
    };

    const handleSaveReview = async () => {
        if (!editingReview) return;

        try {
            await authApi().patch(endpoints.updatereview(editingReview.id), {
                comment: editedComment,
                rating: editedRating,
            });

            notifySuccess('Cập nhật đánh giá thành công');
            setReviews(
                reviews.map((review) =>
                    review.id === editingReview.id
                        ? { ...review, comment: editedComment, rating: editedRating }
                        : review,
                ),
            );

            setEditingReview(null);
        } catch (error) {
            console.error('Failed to update review:', error);
        }
    };

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch = review.comment.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = filterRating === '' || review.rating === parseInt(filterRating);
        return matchesSearch && matchesRating;
    });

    // Phân trang
    const totalReviews = filteredReviews.length;
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterRatingChange = (e) => {
        setFilterRating(e.target.value);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
            2,
            '0',
        )}/${date.getFullYear()}`;
    };

    const renderStars = (rating) => (
        <div className="flex justify-center">
            {Array.from({ length: 5 }, (_, index) => (
                <AiFillStar key={index} color={index < rating ? '#f39c12' : '#e0e0e0'} />
            ))}
        </div>
    );

    return (
        <div className="px-4 py-6 relative">
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-medium">Đánh giá của tôi</h1>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đánh giá..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border border-gray-300 p-2 rounded-md h-full min-w-[200px] focus:ring focus:ring-blue-300"
                    />
                    <select
                        value={filterRating}
                        onChange={handleFilterRatingChange}
                        className="border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-300"
                    >
                        <option value="">Tất cả đánh giá</option>
                        {[1, 2, 3, 4, 5].map((stars) => (
                            <option key={stars} value={stars}>
                                {stars} sao
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <table className="w-full table-auto border-collapse border border-gray-200 mt-4">
                <thead>
                    <tr className="bg-blue-500 text-white">
                        <th className="p-3 border">Mã Đánh Giá</th>
                        <th className="p-3 border">Nội dung</th>
                        <th className="p-3 border">Đánh giá</th>
                        <th className="p-3 border">Ngày tạo</th>
                        <th className="p-3 border">Đánh giá cho</th>
                        <th className="p-3 border">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {currentReviews.length > 0 ? (
                        currentReviews.map((review) => (
                            <tr key={review.id} className="text-center odd:bg-gray-100 even:bg-white">
                                <td className="p-3 border">#{review.id}</td>
                                <td className="p-3 border">{review.comment}</td>
                                <td className="p-3 border">{renderStars(review.rating)}</td>
                                <td className="p-3 border">{formatDate(review.created_at)}</td>
                                <td className="p-3 border">
                                    <div className="flex items-center justify-center gap-2">
                                        <img
                                            src={review.landlord.avatar}
                                            alt={review.landlord.first_name}
                                            className="w-16 h-16 object-cover rounded-full"
                                        />
                                        <div>
                                            <p>
                                                {review.landlord.first_name} {review.landlord.last_name}
                                            </p>
                                            <p className="text-gray-500">{review.landlord.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 border">
                                    <button
                                        className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                                        onClick={() => handleEditReview(review)}
                                        title="Chỉnh sửa"
                                    >
                                        <MdEdit size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="p-4 text-center">
                                Chưa có đánh giá nào...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <PaginationUser currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

            {/* Modal chỉnh sửa đánh giá */}
            {editingReview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-[500px] max-w-full">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Chỉnh sửa đánh giá</h2>

                        {/* Chọn số sao */}
                        <div className="flex justify-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className={`text-3xl transition-colors duration-200 ${
                                        editedRating >= star ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                    onClick={() => setEditedRating(star)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-gray-500 mb-4">{editedRating}/5 sao</p>

                        {/* Nhập nội dung đánh giá */}
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition-all mb-4"
                            rows="4"
                            placeholder="Mô tả trải nghiệm của bạn"
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                        />

                        {/* Nút lưu và hủy */}
                        <div className="flex justify-end gap-3">
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all"
                                onClick={() => setEditingReview(null)}
                            >
                                Hủy
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                                onClick={handleSaveReview}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReviews;
