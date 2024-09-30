import React, { memo, useState, useEffect } from 'react';
import { MdNavigateNext } from 'react-icons/md';
import API, { endpoints } from '../../API';
import NewPost from '././NewPost';

const Sidebar = ({ setSearchParams, searchParams }) => {
    const [roomtype, setRoomType] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                let res = await API.get(endpoints['roomtype']);
                setRoomType(res.data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRoomTypes();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!roomtype) {
        return <div>Loading...</div>;
    }
    const handlePriceClick = (minPrice, maxPrice) => {
        setSearchParams({
            ...searchParams,
            min_price: minPrice,
            max_price: maxPrice,
        });
    };
    const handleAreaClick = (minArea, maxArea) => {
        setSearchParams({
            ...searchParams,
            min_area: minArea,
            max_area: maxArea,
        });
    };
    const handleRoomTypeClick = (roomType) => {
        setSearchParams({
            ...searchParams,
            room_type: roomType,
        });
    };
    const priceRanges = [
        { label: 'Dưới 1 triệu', min: 0, max: 1 },
        { label: 'Từ 1 - 2 triệu', min: 1, max: 2 },
        { label: 'Từ 2 - 3 triệu', min: 2, max: 3 },
        { label: 'Từ 3 - 5 triệu', min: 3, max: 5 },
        { label: 'Từ 5 - 7 triệu', min: 5, max: 7 },
        { label: 'Từ 7 - 10 triệu', min: 7, max: 10 },
        { label: 'Từ 10 - 15 triệu', min: 10, max: 15 },
        { label: 'Trên 15 triệu', min: 15, max: 1000 },
    ];
    const areaRanges = [
        { label: 'Dưới 20 m²', min: 0, max: 20 },
        { label: 'Từ 20 - 30 m²', min: 20, max: 30 },
        { label: 'Từ 30 - 50 m²', min: 30, max: 50 },
        { label: 'Từ 50 - 70 m²', min: 50, max: 70 },
        { label: 'Từ 70 - 90 m²', min: 70, max: 90 },
        { label: 'Trên 90 m²', min: 90, max: '1000' },
    ];
    return (
        <>
            <div className="w-full bg-[#fff] rounded-xl border border-gray-300 p-5 shadow-xl">
                <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">Danh mục cho thuê</h3>
                <div className="flex flex-col gap-2">
                    {roomtype.map((room) => (
                        <p
                            key={room.id}
                            onClick={() => handleRoomTypeClick(room.name)} // Xử lý click loại phòng
                            className="text-[13px] flex items-center gap-1 text-gray-600 text-xl hover:text-red-500 cursor-pointer border-b border-gray-200 pb-1 border-dashed"
                        >
                            <MdNavigateNext size={14} />
                            {room.name}
                        </p>
                    ))}
                </div>
            </div>

            <div className="w-full bg-[#fff] mb-4 rounded-xl border border-gray-300 p-5 shadow-xl mt-0">
                <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">Xem theo giá</h3>
                <div className="flex flex-col gap-2">
                    {priceRanges.map((range, index) => (
                        <p
                            key={index}
                            onClick={() => handlePriceClick(range.min, range.max)}
                            className="text-[13px] flex items-center gap-1 text-gray-600 text-xl hover:text-red-600 cursor-pointer border-b border-gray-200 pb-1 border-dashed"
                        >
                            <MdNavigateNext size={14} /> {range.label}
                        </p>
                    ))}
                </div>
            </div>

            <div className="w-full bg-[#fff] mb-5 rounded-xl border border-gray-300 border-b-2 p-5 shadow-xl">
                <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">Xem theo diện tích</h3>
                <div className="flex flex-col gap-2">
                    {areaRanges.map((range, index) => (
                        <p
                            key={index}
                            onClick={() => handleAreaClick(range.min, range.max)}
                            className="text-[13px] flex items-center gap-1 text-gray-600 text-xl hover:text-red-600 cursor-pointer border-b border-gray-200 pb-1 border-dashed"
                        >
                            <MdNavigateNext size={14} /> {range.label}
                        </p>
                    ))}
                </div>
            </div>
            <div className="w-full bg-[#fff] mb-5 rounded-xl border border-gray-300 border-b-2 p-5 shadow-xl">
                <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">Tin mới đăng</h3>
                <NewPost />
            </div>
        </>
    );
};

export default memo(Sidebar);
