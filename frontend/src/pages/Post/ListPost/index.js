import React, { useEffect, useState } from 'react';
import '../../../output.css';
import Item from '../../DefaultLayout/Item';
import Button from '../../DefaultLayout/Button';
import API, { endpoints } from '../../../API';

const ListPost = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1); // Fix currentPage
    const [totalPages, setTotalPages] = useState(1); // Fix totalPages
    const postsPerPage = 5; // =page_size (pagination django)

    // Function to extract the page number from a URL
    const getPageNumber = (url) => {
        if (!url) return currentPage;

        try {
            // Handle relative URLs by adding the current domain
            const absoluteUrl = new URL(url, window.location.origin);
            const urlParams = new URLSearchParams(absoluteUrl.search);
            return parseInt(urlParams.get('page')) || 1; // Default to page 1 if no page param
        } catch (error) {
            console.error('Invalid URL:', url);
            return currentPage; // In case of error, fallback to current page
        }
    };

    // Function to fetch data from the API
    const fetchData = async (url) => {
        try {
            const result = await API.get(url);
            setData(result.data.results);
            setNextPage(result.data.next);
            setPreviousPage(result.data.previous);
            setCount(result.data.count);
            setTotalPages(Math.ceil(result.data.count / postsPerPage));

            const pageFromUrl = getPageNumber(url); // Extract page number from URL
            setCurrentPage(pageFromUrl); // Set the correct current page

            console.log('Current URL:', url);
            console.log('Current Page:', pageFromUrl);
            console.log('Total Pages:', Math.ceil(result.data.count / postsPerPage));
        } catch (err) {
            setError(err.message);
        }
    };
    useEffect(() => {
        fetchData(endpoints['post']);
    }, []);

    const handlePageChange = (url) => {
        if (url) {
            fetchData(url);
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

    const renderButton = (pageNumber) => (
        <button
            key={pageNumber}
            onClick={() => fetchData(`${endpoints['post']}?page=${pageNumber}`)}
            className={`px-3 py-1 mx-1 border rounded ${
                pageNumber === currentPage ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-400'
            }`}
        >
            {pageNumber}
        </button>
    );
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="w-full border-blue-600 shadow-md rounded-md bg-[#fff]">
            <div className="flex items-centre justify-between my-3 pt-5 px-4">
                <h3 className="font-semibold text-4xl">TỔNG {count} KẾT QUẢ</h3>
                <span>Cập nhập: 12:05</span>
            </div>
            <div className="flex items-center gap-3 my-4 px-4">
                <span>Sắp xếp:</span>
                <Button bgColor="bg-gray-200" text="Mặc định" />
                <Button bgColor="bg-gray-200" text="Mới nhất" />
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
                        />
                    ))
                ) : (
                    <p>No posts available.</p>
                )}
            </div>

            {/* Pagination Component */}
            <div className="pagination flex justify-center my-4">
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
