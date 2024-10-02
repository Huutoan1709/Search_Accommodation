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
    const postsPerPage = 10; // =page_size (pagination django)
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const lastUrl = useRef('');

    const fetchData = async (url) => {
        setLoading(true);
        try {
            const result = await API.get(url);
            setData(result.data.results);
            setNextPage(result.data.next);
            setPreviousPage(result.data.previous);
            setCount(result.data.count);
            setTotalPages(Math.ceil(result.data.count / postsPerPage));

            const pageFromUrl = new URL(url, window.location.origin).searchParams.get('page') || 1;
            setCurrentPage(parseInt(pageFromUrl, 10));
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
        console.log('fetchData', url);
    };

    useEffect(() => {
        const params = new URLSearchParams(searchParams).toString();
        const fetchUrl = params ? `${endpoints['post']}?${params}` : endpoints['post'];

        if (fetchUrl !== lastUrl.current) {
            lastUrl.current = fetchUrl;
            fetchData(fetchUrl);
        }

        if (!searchParams || Object.keys(searchParams).length === 0) {
            setTitle(`Danh sách bài đăng toàn quốc hiện có ${count} bài đăng.`);
        } else {
            let titleText = 'Danh sách bài đăng';
            if (searchParams.room_type) titleText += ` cho thuê ${searchParams.room_type}`;
            if (searchParams.ward) titleText += ` phường ${searchParams.ward}`;
            if (searchParams.district) titleText += `, ${searchParams.district}`;
            if (searchParams.city) titleText += `, ${searchParams.city}`;
            if (searchParams.min_price && searchParams.max_price) {
                titleText += ` giá từ ${searchParams.min_price} đến ${searchParams.max_price}`;
            }
            if (searchParams.max_area) {
                titleText += `, diện tích dưới ${searchParams.max_area}m²`;
            }

            setTitle(titleText);
        }
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
                    <p>CHƯA CÓ BÀI ĐĂNG.....</p>
                )}
            </div>

            {/* Pagination Component */}
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
