import React, { useEffect, useState, useContext } from 'react';
import { authApi, endpoints } from '../../../API';
import { AiFillStar } from 'react-icons/ai';
import PaginationUser from '../../../components/PaginationUser';
import MyContext from '../../../context/MyContext';

const ReceivedReviews = () => {
    // Add user context
    const { user } = useContext(MyContext);
    
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const reviewsPerPage = 10;
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        starCounts: [0, 0, 0, 0, 0]
    });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Use user.id instead of 'current'
                const response = await authApi().get(endpoints.reviewlandlord(user?.id));
                setReviews(response.data);
                calculateStats(response.data);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            }
        };

        // Only fetch if we have a user ID
        if (user?.id) {
            fetchReviews();
        }
    }, [user]); // Add user as dependency

    const calculateStats = (reviewsData) => {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
        const average = total > 0 ? sum / total : 0;
        
        const counts = [0, 0, 0, 0, 0];
        reviewsData.forEach(review => {
            counts[5 - review.rating]++;
        });

        setStats({
            averageRating: average.toFixed(1),
            totalReviews: total,
            starCounts: counts
        });
    };

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch = review.comment.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = filterRating === '' || review.rating === parseInt(filterRating);
        return matchesSearch && matchesRating;
    });

    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    return (
        <div className="px-6 py-8 min-h-screen bg-gray-50">
            {/* Stats Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall Rating */}
                    <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-amber-500">{stats.averageRating}</div>
                        <div className="flex flex-col">
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <AiFillStar 
                                        key={i} 
                                        className={i < Math.round(stats.averageRating) ? 'text-amber-400' : 'text-gray-200'}
                                        size={24}
                                    />
                                ))}
                            </div>
                            <div className="text-gray-500">({stats.totalReviews} đánh giá)</div>
                        </div>
                    </div>

                    {/* Rating Bars */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star, index) => (
                            <div key={star} className="flex items-center gap-2">
                                <span className="w-20 text-xl text-gray-600">{star} sao</span>
                                <div className="flex-1 bg-gray-200 h-2 rounded-full">
                                    <div
                                        className="bg-amber-400 h-2 rounded-full"
                                        style={{ 
                                            width: `${stats.totalReviews > 0 
                                                ? (stats.starCounts[5-star] / stats.totalReviews) * 100 
                                                : 0}%` 
                                        }}
                                    />
                                </div>
                                <span className="w-12 text-xl text-gray-600">
                                    {stats.totalReviews > 0 
                                        ? Math.round((stats.starCounts[5-star] / stats.totalReviews) * 100)
                                        : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm đánh giá..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                        <option value="">Tất cả đánh giá</option>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <option key={star} value={star}>{star} sao</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {currentReviews.map((review) => (
                        <div key={review.id} className="p-6">
                            <div className="flex items-start gap-4">
                                <img
                                    src={review.customer.avatar}
                                    alt={review.customer.first_name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {review.customer.first_name} {review.customer.last_name}
                                            </h3>
                                            <p className="text-lg text-gray-500">{formatDate(review.created_at)}</p>
                                        </div>
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <AiFillStar 
                                                    key={i}
                                                    className={i < review.rating ? 'text-amber-400' : 'text-gray-200'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-gray-600">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {currentReviews.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            Chưa có đánh giá nào
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <PaginationUser
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    );
};

export default ReceivedReviews;