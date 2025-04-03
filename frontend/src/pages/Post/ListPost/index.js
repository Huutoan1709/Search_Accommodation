import React, { useEffect, useState, useRef } from 'react';
import '../../../output.css';
import Item from '../../DefaultLayout/Item';
import API, { endpoints } from '../../../API';
import Pagination from '../../../components/Pagination';

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
            setData(postsWithCoordinates);
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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="w-full border border-gray-300 rounded-xl p-4 bg-[#fff]">
            <div className="flex items-center justify-between my-3">
                <h3 className="font-semibold text-2xl px-4">{title}</h3>
            </div>

            <div className="items">
                {data.length > 0 ? (
                    data.map((item) => (
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
                        />
                    ))
                ) : (
                    <p className="items-center justify-center">CHƯA CÓ BÀI ĐĂNG LIÊN QUAN.....</p>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                previousPage={previousPage}
                nextPage={nextPage}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default ListPost;
