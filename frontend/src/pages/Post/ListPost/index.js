import React, { useEffect, useState, useRef } from 'react';
import '../../../output.css';
import Item from '../../DefaultLayout/Item';
import API, { endpoints } from '../../../API';
import Pagination from '../../../components/Pagination';
import Loading from '../../../components/Loading';
import { FaBoxOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ListPost = ({ searchParams }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 10;
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const lastUrl = useRef('');

    const fetchData = async (url) => {
        setLoading(true);
        try {
            const result = await API.get(url);
            const postsWithCoordinates = result.data.results.filter(
                (post) => post.room && post.room.latitude && post.room.longitude,
            );

            // Sort posts: VIP first, then by creation date
            const sortedPosts = postsWithCoordinates.sort((a, b) => {
                // First compare by post type (VIP takes precedence)
                if (a.post_type?.name === 'VIP' && b.post_type?.name !== 'VIP') return -1;
                if (a.post_type?.name !== 'VIP' && b.post_type?.name === 'VIP') return 1;
                
                // If post types are the same, sort by creation date (newest first)
                return new Date(b.created_at) - new Date(a.created_at);
            });

            setData(sortedPosts);
            setNextPage(result.data.next);
            setPreviousPage(result.data.previous);
            setCount(result.data.count);
            setTotalPages(Math.ceil(result.data.count / postsPerPage));

            const pageFromUrl = new URL(url, window.location.origin).searchParams.get('page') || 1;
            setCurrentPage(parseInt(pageFromUrl, 10));
            window.scrollTo(0, 0);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
        console.log('fetchData posts', url);
    };

    useEffect(() => {
        const params = new URLSearchParams(searchParams).toString();
        const fetchUrl = params ? `${endpoints['post']}?${params}` : endpoints['post'];

        if (fetchUrl !== lastUrl.current) {
            lastUrl.current = fetchUrl;
            fetchData(fetchUrl);
        }

        // Cập nhật title dựa trên searchParams
        const searchParamsObj = new URLSearchParams(searchParams);
        let titleText = 'Danh sách bài đăng';

        // Xử lý room_type
        const roomType = searchParamsObj.get('room_type');
        if (roomType) {
            titleText += ` ${roomType}`;
        }

        // Xử lý location
        const ward = searchParamsObj.get('ward');
        const district = searchParamsObj.get('district');
        const city = searchParamsObj.get('city');

        let locationText = '';

        if (ward && district && city) {
            locationText = `${ward}, ${district}, ${city}`;
        } else if (ward && district) {
            locationText = `${ward}, ${district}`;
        } else if (ward && city) {
            locationText = `${ward}, ${city}`;
        } else if (district && city) {
            locationText = `${district}, ${city}`;
        } else if (ward) {
            locationText = ward;
        } else if (district) {
            locationText = district;
        } else if (city) {
            locationText = city;
        }

        if (locationText) {
            titleText += ` tại ${locationText}`;
        }

        // Xử lý khoảng giá
        const minPrice = searchParamsObj.get('min_price');
        const maxPrice = searchParamsObj.get('max_price');

        if (minPrice && maxPrice) {
            titleText += ` giá từ ${minPrice} - ${maxPrice} triệu`;
        } else if (minPrice) {
            titleText += ` giá từ ${minPrice} triệu`;
        } else if (maxPrice) {
            titleText += ` giá đến ${maxPrice} triệu`;
        }

        // Xử lý khoảng diện tích
        const minArea = searchParamsObj.get('min_area');
        const maxArea = searchParamsObj.get('max_area');

        if (minArea && maxArea) {
            titleText += ` diện tích ${minArea} - ${maxArea}m²`;
        } else if (minArea) {
            titleText += ` diện tích từ ${minArea}m²`;
        } else if (maxArea) {
            titleText += ` diện tích đến ${maxArea}m²`;
        }

        // Thêm số lượng kết quả
        titleText += ` (${count} kết quả)`;

        // Nếu không có điều kiện tìm kiếm
        if (!searchParams || searchParams === '') {
            titleText = `Danh sách bài đăng toàn quốc (${count} bài đăng)`;
        }

        setTitle(titleText);
    }, [searchParams, count]);

    const handlePageChange = (page) => {
        const currentParams = new URLSearchParams(searchParams);
        currentParams.set('page', page);

        const fetchUrl = `${endpoints['post']}?${currentParams.toString()}`;
        fetchData(fetchUrl);
    };

    const EmptyState = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[400px] p-8"
        >
            <FaBoxOpen className="text-gray-400 text-6xl mb-4"/>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                Không tìm thấy bài đăng nào
            </h3>
            <p className="text-gray-500 text-center max-w-md">
                Hiện tại chưa có bài đăng nào phù hợp với tiêu chí tìm kiếm của bạn. 
                Vui lòng thử lại với các tiêu chí khác.
            </p>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="w-full border border-gray-300 rounded-xl p-4 bg-[#fff]">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full border border-gray-300 rounded-xl p-4 bg-[#fff]">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-red-500 text-xl mb-4">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 text-lg">Đã có lỗi xảy ra: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full border border-gray-300 rounded-xl p-4 bg-[#fff]">
            <div className="flex items-center justify-between my-3">
                <h3 className="font-semibold text-2xl px-4">{title}</h3>
            </div>

            <div className="items">
                {data.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {data.map((item) => (
                            <Item
                                key={item?.id}
                                room={item?.room}
                                title={item?.title}
                                content={item?.content}
                                created_at={item?.created_at}
                                images={item?.images}
                                user={item?.user}
                                id={item?.id}
                                created_at_humanized={item?.created_at_humanized}
                                post_type={item?.post_type}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <EmptyState />
                )}
            </div>

            {data.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    previousPage={previousPage}
                    nextPage={nextPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default ListPost;
