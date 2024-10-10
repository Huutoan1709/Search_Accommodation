import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { MdDelete } from 'react-icons/md';
import PaginationUser from '../../../components/PaginationUser';
import { notifySuccess } from '../../../components/ToastManager';
import { AiFillStar } from 'react-icons/ai';

const MyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState(''); // Filter by star rating
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

    const handleDeleteReview = async (reviewId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?');
        if (confirmDelete) {
            try {
                await authApi().delete(endpoints.deletereview(reviewId));
                notifySuccess('Xóa đánh giá thành công');
                setReviews(reviews.filter((review) => review.id !== reviewId));
            } catch (error) {
                console.error('Failed to delete review:', error);
            }
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
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderStars = (rating) => {
        return (
            <div className="flex justify-center">
                {Array.from({ length: 5 }, (_, index) => (
                    <AiFillStar key={index} color={index < rating ? '#f39c12' : '#e0e0e0'} />
                ))}
            </div>
        );
    };

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
                        <th className="p-3 border">Chủ nhà</th>
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
                                        className="bg-red-500 text-white px-3 py-2 rounded mr-2 hover:bg-red-600"
                                        onClick={() => handleDeleteReview(review.id)}
                                        title="Xóa"
                                    >
                                        <MdDelete size={15} />
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
        </div>
    );
};

export default MyReviews;
