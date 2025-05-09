import React from 'react';
import { BeatLoader } from 'react-spinners';

const Loading = ({ message = "Đang tải dữ liệu...", className = "" }) => {
    return (
        <div className={`flex flex-col items-center justify-center min-h-[400px] w-full ${className}`}>
            <BeatLoader color="#3B82F6" size={15} margin={2} />
            <p className="mt-4 text-gray-600 text-lg">{message}</p>
        </div>
    );
};

export default Loading;