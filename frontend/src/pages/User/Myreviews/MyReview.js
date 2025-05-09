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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-2">
                        <AiFillStar className="text-white" size={32} />
                        Đánh giá của tôi
                    </h2>
                </div>

                {/* Search and Filter Section */}
                <div className="p-6 border-b border-gray-200 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm đánh giá..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full md:w-80 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pl-10"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select
                            value={filterRating}
                            onChange={handleFilterRatingChange}
                            className="w-full md:w-48 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                            <option value="">Tất cả đánh giá</option>
                            {[5, 4, 3, 2, 1].map((stars) => (
                                <option key={stars} value={stars}>
                                    {stars} sao
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Reviews Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Mã Đánh Giá</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Nội dung</th>
                                <th className="px-6 py-4 text-center text-xl font-medium text-gray-500">Đánh giá</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Ngày tạo</th>
                                <th className="px-6 py-4 text-left text-xl font-medium text-gray-500">Đánh giá cho</th>
                                <th className="px-6 py-4 text-center text-xl font-medium text-gray-500">Tùy chọn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentReviews.length > 0 ? (
                                currentReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 text-xl text-gray-900">#{review.id}</td>
                                        <td className="px-6 py-4 text-xl text-gray-500 max-w-xs truncate">
                                            {review.comment}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center text-amber-400">
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <AiFillStar 
                                                        key={index} 
                                                        className={index < review.rating ? 'text-amber-400' : 'text-gray-200'}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xl text-gray-500">
                                            {formatDate(review.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={review.landlord.avatar}
                                                    alt={review.landlord.first_name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="text-xl font-medium text-gray-900">
                                                        {review.landlord.first_name} {review.landlord.last_name}
                                                    </p>
                                                    <p className="text-xl text-gray-500">{review.landlord.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleEditReview(review)}
                                                className="text-amber-600 hover:text-amber-900 transition-colors duration-200 p-2 hover:bg-amber-50 rounded-full"
                                                title="Chỉnh sửa"
                                            >
                                                <MdEdit size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Chưa có đánh giá nào...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6">
                    <PaginationUser
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Edit Review Modal */}
                {editingReview && (
                    <>
                        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                        Chỉnh sửa đánh giá
                                    </h2>

                                    {/* Rating Stars */}
                                    <div className="flex justify-center gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                className={`text-3xl transition-colors duration-200 ${
                                                    editedRating >= star ? 'text-amber-400' : 'text-gray-300'
                                                }`}
                                                onClick={() => setEditedRating(star)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-gray-500 mb-4">{editedRating}/5 sao</p>

                                    {/* Review Content */}
                                    <textarea
                                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none mb-6"
                                        rows="4"
                                        placeholder="Mô tả trải nghiệm của bạn"
                                        value={editedComment}
                                        onChange={(e) => setEditedComment(e.target.value)}
                                    />

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-4">
                                        <button
                                            className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                            onClick={() => setEditingReview(null)}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                            onClick={handleSaveReview}
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyReviews;
