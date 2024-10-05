import React, { useEffect, useState } from 'react';
import Header from '../../DefaultLayout/Header';
import Footer from '../../DefaultLayout/footer';
import BackgroundPersonal from '../../../assets/BackgroundPersonal.jpg';
import zalo from '../../../assets/zalo.png';
import { authApi, endpoints } from '../../../API';
import { FaLocationDot } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';
import BackToTop from '../../../components/BackToTop';
import { notifySuccess, notifyError } from '../../../components/ToastManager';
import { AiFillSafetyCertificate } from 'react-icons/ai';

const Personal = () => {
    const [posts, setPosts] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const navigate = useNavigate();
    const { userId } = useParams();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                if (userId === 'current') {
                    const response = await authApi().get(endpoints.mypost);
                    setPosts(response.data);
                } else {
                    const response = await authApi().get(endpoints.postuser(userId));
                    setPosts(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        };

        const fetchUserInfo = async () => {
            try {
                if (userId === 'current') {
                    const response = await authApi().get(endpoints.currentuser);
                    setUserInfo(response.data);
                } else {
                    const response = await authApi().get(endpoints.detailuser(userId));
                    setUserInfo(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        };

        fetchPosts();
        fetchUserInfo();
    }, [userId]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const userIdToFetch = userId === 'current' ? userInfo?.id : userId;
                const response = await authApi().get(endpoints.reviewlandlord(userIdToFetch));
                setReviews(response.data);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            }
        };

        if (userInfo) {
            fetchReviews();
        }
    }, [userInfo]);
    const calculateRatingStats = () => {
        const totalReviews = reviews.length;

        if (totalReviews === 0) {
            return {
                averageRating: '0.0',
                starPercentages: [0, 0, 0, 0, 0],
            };
        }

        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
        const starCounts = [0, 0, 0, 0, 0];

        reviews.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) {
                starCounts[5 - review.rating] += 1;
            }
        });

        return {
            averageRating: averageRating.toFixed(1),
            starPercentages: starCounts.map((count) => ((count / totalReviews) * 100).toFixed(1)),
        };
    };

    const ratingStats = calculateRatingStats();

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

    const handleRatingChange = (star) => {
        setRating(star);
    };

    const handleFeedbackChange = (e) => {
        setFeedback(e.target.value);
    };

    const handleSubmitRating = async () => {
        if (rating === 0) {
            notifyError('Vui lòng chọn xếp hạng.');
            return;
        }

        try {
            const response = await authApi().post(endpoints.review, {
                landlord: userId,
                rating: rating,
                comment: feedback,
            });

            if (response.status === 201) {
                notifySuccess('Đánh giá đã được gửi thành công!');
                setRating(0);
                setFeedback('');
                const userIdToFetch = userId === 'current' ? userInfo?.id : userId;
                const reviewResponse = await authApi().get(endpoints.reviewlandlord(userIdToFetch));
                setReviews(reviewResponse.data);
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 403) {
                    notifyError('Chỉ người dùng có vai trò "CUSTOMER" mới có thể thực hiện đánh giá.');
                } else if (err.response.status === 404) {
                    notifyError('Chủ trọ không tồn tại.');
                } else if (err.response.status === 400) {
                    notifyError(err.response.data.error);
                } else {
                    notifyError('Đảm bảo nhập đầy đủ thông tin và thử lại!');
                }
            } else {
                notifyError('Lỗi kết nối mạng. Vui lòng thử lại sau.');
            }
            console.error(err);
        }
    };
    return (
        <div>
            <Header />
            <div className="bg-gray-100 min-h-screen">
                <div className="relative bg-white shadow-md">
                    <img src={BackgroundPersonal} alt="Background" className="w-full h-[250px] object-cover" />
                    <div className="relative w-[1024px] m-auto -mt-16">
                        <div className="flex items-center bg-white p-6 rounded-lg shadow-xl gap-2">
                            <img
                                src={userInfo?.avatar}
                                alt="avatar"
                                className="w-24 h-24 rounded-full border-4 border-white shadow-md"
                            />
                            <div className="ml-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        {userInfo?.first_name} {userInfo?.last_name}
                                    </h2>
                                    <div>
                                        {userInfo?.reputation && (
                                            <div className="flex items-center justify-center">
                                                <AiFillSafetyCertificate size={20} color="green" />
                                                <p className="text-green-700 font-lg">Chủ trọ uy tín</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center mt-2">
                                    <a
                                        href={`https://zalo.me/${userInfo?.phone}`}
                                        className="bg-white text-black font-base border border-gray-500 px-4 h-12 rounded-lg flex items-center mr-4 hover:bg-gray-50 transition"
                                    >
                                        <img src={zalo} alt="Zalo" className="w-5 h-5 mr-2" />
                                        Chat Zalo
                                    </a>
                                    <span className="bg-white text-black border border-gray-500 px-4 h-12 rounded-lg flex items-center">
                                        {userInfo?.phone}
                                    </span>
                                </div>
                                <div className="mt-2 relative">
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600 transition"
                                        onMouseEnter={() => setShowTooltip(true)}
                                        onMouseLeave={() => setShowTooltip(false)}
                                    >
                                        Theo dõi
                                    </button>
                                    {showTooltip && (
                                        <div className="absolute left-0 bg-black text-white text-sm px-2 py-1 rounded mt-1">
                                            Theo dõi để nhận được thông báo sớm nhất về bài đăng
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-[1024px] m-auto mt-8">
                    <h3 className="px-6 py-2 font-semibold border-b-2 border-red-500 text-red-500 text-2xl">
                        Tin đăng ({posts.length})
                    </h3>

                    <div className="grid grid-cols-3 gap-6 mt-4">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white shadow-xl rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                                    onClick={() => navigate(`/post/${post.id}`)}
                                >
                                    <img
                                        src={post?.images[0]?.url}
                                        alt={post?.title}
                                        className="w-full h-[180px] object-cover"
                                    />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {post?.title?.length > 70 ? `${post?.title.slice(0, 70)}...` : post?.title}
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <p className="text-red-500 font-semibold mb-1 text-xl">
                                                {post?.room?.price} triệu
                                            </p>
                                            <p className="text-red-500 font-semibold mb-1 text-xl">
                                                {post?.room?.area}m²
                                            </p>
                                        </div>
                                        <div className="flex gap-1 items-center my-2">
                                            <FaLocationDot size={13} color="red" />
                                            <p className="text-gray-600 text-xl">{`${post?.room?.district}, ${post?.room?.city}`}</p>
                                        </div>
                                        <p className="text-gray-400 text-lg">
                                            Ngày đăng: {calculateEndDate(post?.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Chưa có bài đăng nào...</p>
                        )}
                    </div>
                </div>
                {/* Overall Rating Section */}
                {reviews.length > 0 && (
                    <div className="w-[1024px] m-auto mt-8 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                            Đánh giá nhận xét về {userInfo?.first_name} {userInfo?.last_name}
                        </h3>
                        <div className="flex items-center">
                            <div className="text-yellow-400 text-4xl mr-4">{ratingStats.averageRating} ★</div>
                            <p className="text-gray-500">({reviews.length} đánh giá)</p>
                        </div>
                        <div className="mt-4">
                            {[5, 4, 3, 2, 1].map((star, index) => (
                                <div key={star} className="flex items-center mb-2">
                                    <span>{star}★</span>
                                    <div className="flex-1 mx-4 bg-gray-300 h-4 rounded-full">
                                        <div
                                            className="bg-yellow-400 h-4 rounded-full"
                                            style={{ width: `${ratingStats.starPercentages[index]}%` }}
                                        ></div>
                                    </div>
                                    <span>{ratingStats.starPercentages[index]}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                {reviews.length > 0 && (
                    <div className="w-[1024px] m-auto mt-8 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Các nhận xét gần đây</h3>
                        {reviews.map((review) => (
                            <div key={review.id} className="border-b py-4 flex items-center">
                                <img
                                    src={review?.customer?.avatar}
                                    alt={`${review.customer.first_name} ${review.customer.last_name}`}
                                    className="w-12 h-12 rounded-full mr-4"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-2xl font-semibold">
                                            {review.customer.first_name} {review.customer.last_name}
                                        </h4>
                                        <div className="text-yellow-400 text-2xl">
                                            {'★'.repeat(review.rating)}
                                            {'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <p className="text-gray-500">{formatDate(review.created_at)}</p>
                                    <p className="text-gray-800 mt-2">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Rating Section for User */}
                <div>
                    {/* Phần đánh giá */}
                    {userId !== 'current' && (
                        <div className="w-[1024px] m-auto mt-8 bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                Đánh giá nhận xét về {userInfo?.first_name} {userInfo?.last_name}
                            </h3>
                            <div className="flex items-center mb-6">
                                <div className="text-yellow-400 text-2xl mr-2">
                                    {'★'.repeat(rating)}
                                    {'☆'.repeat(5 - rating)}
                                </div>
                                <p className="text-gray-500">{rating}/5 sao</p>
                            </div>

                            <textarea
                                className="w-full p-4 border border-gray-300 rounded-lg mb-4"
                                rows="4"
                                placeholder="Mô tả trải nghiệm của bạn khi làm việc với người này"
                                value={feedback}
                                onChange={handleFeedbackChange}
                            />

                            <div className="flex justify-between">
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            className={`px-4 py-2 border rounded-lg ${
                                                rating === star ? 'bg-yellow-400 text-white' : 'bg-gray-200'
                                            }`}
                                            onClick={() => handleRatingChange(star)}
                                        >
                                            {star} ★
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                    onClick={handleSubmitRating}
                                >
                                    Gửi đánh giá
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <BackToTop />
            <Footer />
        </div>
    );
};

export default Personal;
