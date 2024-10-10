// PaginationUser.js
import React from 'react';

const PaginationUser = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber);
        }
    };

    return (
        <div className="flex justify-between items-center mt-6">
            <span className="text-gray-700">
                Hiển thị {currentPage > totalPages ? 0 : (currentPage - 1) * 10 + 1} đến{' '}
                {Math.min(currentPage * 10, totalPages * 10)}
            </span>

            <div>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 mx-1 rounded-md bg-gray-300 text-black hover:bg-gray-400 transition-colors duration-300"
                    disabled={currentPage === 1}
                >
                    &lt;&lt;
                </button>
                <button
                    onClick={() => handlePageChange(1)}
                    className={`px-4 py-2 mx-1 rounded-md ${
                        currentPage === 1
                            ? 'bg-red-500 text-white font-semibold'
                            : 'bg-gray-300 text-black hover:bg-gray-400'
                    } transition-colors duration-300`}
                >
                    1
                </button>
                {Array.from({ length: totalPages }, (_, index) => {
                    const pageNum = index + 1;
                    if (pageNum !== 1 && (Math.abs(currentPage - pageNum) <= 2 || pageNum === totalPages)) {
                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-4 py-2 mx-1 rounded-md ${
                                    currentPage === pageNum
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-300 text-black hover:bg-gray-400'
                                } transition-colors duration-300`}
                            >
                                {pageNum}
                            </button>
                        );
                    }
                    return null;
                })}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 mx-1 rounded-md bg-gray-300 text-black hover:bg-gray-400 transition-colors duration-300"
                    disabled={currentPage === totalPages}
                >
                    &gt;&gt;
                </button>
            </div>
        </div>
    );
};

export default PaginationUser;
