import React from 'react';

const Pagination = ({ currentPage, totalPages, previousPage, nextPage, onPageChange }) => {
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
        return (
            <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`px-3 py-1 mx-1 border rounded ${
                    pageNumber === currentPage ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-400'
                }`}
            >
                {pageNumber}
            </button>
        );
    };

    return (
        <div className="pagination flex justify-center my-4 ">
            <button
                disabled={!previousPage}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-1 mx-1 border rounded bg-gray-200 hover:bg-gray-400"
            >
                « Trang trước
            </button>

            {renderPageNumbers()}

            <button
                disabled={!nextPage}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-1 mx-1 border rounded bg-gray-200 hover:bg-gray-400"
            >
                Trang sau »
            </button>
        </div>
    );
};

export default Pagination;
