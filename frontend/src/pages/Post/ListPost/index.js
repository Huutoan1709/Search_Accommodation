import React, { useEffect, useState, useRef } from 'react';
import '../../../output.css';
import Item from '../../DefaultLayout/Item';
import API, { endpoints } from '../../../API';

const ListPost = ({ searchParams }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 2; // =page_size (pagination django)
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const lastUrl = useRef(''); //
    const fetchData = async (url) => {
        setLoading(true);
        try {
            const result = await API.get(url);
            setData(result.data.results);
            setNextPage(result.data.next);
            setPreviousPage(result.data.previous);
            setCount(result.data.count);
            setTotalPages(Math.ceil(result.data.count / postsPerPage));

            // Lấy trang từ URL
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
        // Tạo URL tìm kiếm dựa trên tham số tìm kiếm hiện tại
        const params = new URLSearchParams(searchParams).toString();
        const fetchUrl = params ? `${endpoints['post']}?${params}` : endpoints['post'];

        // Tránh gọi fetchData nếu URL giống với lần gọi trước
        if (fetchUrl !== lastUrl.current) {
            lastUrl.current = fetchUrl;
            fetchData(fetchUrl);
        }

        // Tạo tiêu đề động dựa trên các tiêu chí tìm kiếm
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
    const handlePageChange = (url) => {
        if (url) {
            const currentParams = new URLSearchParams(searchParams);
            const urlObj = new URL(url, window.location.origin);
            const urlParams = new URLSearchParams(urlObj.search);

            // Chỉ giữ lại tham số 'page' từ URL của trang tiếp theo
            const page = urlParams.get('page');
            if (page) {
                currentParams.set('page', page); // Thay đổi page trong params hiện tại
            }

            const fetchUrl = `${endpoints['post']}?${currentParams.toString()}`;
            fetchData(fetchUrl);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const startPage = Math.max(currentPage - 2, 1);
        const endPage = Math.min(currentPage + 2, totalPages);

        if (currentPage > 3) {
            pageNumbers.push(renderButton(1));
            if (currentPage > 4) {
                pageNumbers.push(<span key="start-ellipsis">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(renderButton(i));
        }

        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pageNumbers.push(<span key="end-ellipsis">...</span>);
            }
            pageNumbers.push(renderButton(totalPages));
        }

        return pageNumbers;
    };

    const renderButton = (pageNumber) => {
        const currentParams = new URLSearchParams(searchParams); // Lấy các tham số tìm kiếm hiện tại
        currentParams.set('page', pageNumber); // Thay đổi giá trị của page trong searchParams
        const fetchUrl = `${endpoints['post']}?${currentParams.toString()}`; // Tạo URL với các tham số tìm kiếm và page

        return (
            <button
                key={pageNumber}
                onClick={() => fetchData(fetchUrl)} // Gọi fetchData với URL mới chứa cả các tham số tìm kiếm và số trang
                className={`px-3 py-1 mx-1 border rounded ${
                    pageNumber === currentPage ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-400'
                }`}
            >
                {pageNumber}
            </button>
        );
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
            <div className="pagination flex justify-center my-4 border-t-2 border-red-300">
                <button
                    disabled={!previousPage}
                    onClick={() => handlePageChange(previousPage)}
                    className="px-3 py-1 mx-1 border rounded bg-gray-200 hover:bg-gray-400"
                >
                    « Trang trước
                </button>

                {renderPageNumbers()}

                <button
                    disabled={!nextPage}
                    onClick={() => handlePageChange(nextPage)}
                    className="px-3 py-1 mx-1 border rounded bg-gray-200 hover:bg-gray-400"
                >
                    Trang sau »
                </button>
            </div>
        </div>
    );
};

export default ListPost;
