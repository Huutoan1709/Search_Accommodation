import React, { memo, useState, useEffect } from 'react';
import { MdNavigateNext } from 'react-icons/md';
import API, { endpoints } from '../../API';
import NewPost from '././NewPost';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setSearchParams, searchParams, room_type }) => {
    const [roomtype, setRoomType] = useState([]);
    const [error, setError] = useState('');
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);
    const [selectedAreaRange, setSelectedAreaRange] = useState(null);
    const navigate = useNavigate();
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
    const handlePriceClick = (minPrice, maxPrice, index) => {
        setSearchParams({
            ...searchParams,
            min_price: minPrice,
            max_price: maxPrice,
            room_type: room_type,
        });
        setSelectedPriceRange(index);
    };

    const handleAreaClick = (minArea, maxArea, index) => {
        setSearchParams({
            ...searchParams,
            min_area: minArea,
            max_area: maxArea,
            room_type: room_type,
        });
        setSelectedAreaRange(index);
    };
    const handleRoomTypeClick = (roomType, id) => {
        setSelectedRoomType(id);
        if (roomType === 'Nhà nguyên căn') {
            navigate('/nha-nguyen-can');
        }
        if (roomType === 'Phòng Trọ') {
            navigate('/');
        }
        if (roomType === 'Căn hộ dịch vụ') {
            navigate('/can-ho-dich-vu');
        }
        if (roomType === 'Chung Cư') {
            navigate('/chung-cu');
        }
    };
    const priceRanges = [
        { label: 'Dưới 1 triệu', min: 0, max: 1 },
        { label: 'Từ 1 - 2 triệu', min: 1, max: 2 },
        { label: 'Từ 2 - 3 triệu', min: 2, max: 3 },
        { label: 'Từ 3 - 5 triệu', min: 3, max: 5 },
        { label: 'Từ 5 - 7 triệu', min: 5, max: 7 },
        { label: 'Từ 7 - 10 triệu', min: 7, max: 10 },
        { label: 'Từ 10 - 15 triệu', min: 10, max: 15 },
        { label: 'Trên 15 triệu', min: 15, max: '' },
    ];
    const areaRanges = [
        { label: 'Dưới 20 m²', min: 0, max: 20 },
        { label: 'Từ 20 - 30 m²', min: 20, max: 30 },
        { label: 'Từ 30 - 50 m²', min: 30, max: 50 },
        { label: 'Từ 50 - 70 m²', min: 50, max: 70 },
        { label: 'Từ 70 - 90 m²', min: 70, max: 90 },
        { label: 'Trên 90 m²', min: 90, max: '' },
    ];
    return (
        <>
            {/* Category Section */}
            <div className="w-full bg-white rounded-xl border border-gray-300 p-3 md:p-5 shadow-xl">
                <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4 border-b-2 border-gray-300 pb-2">
                    Danh mục cho thuê
                </h3>
                <div className="flex flex-col gap-1 md:gap-2">
                    {roomtype.map((room) => (
                        <p
                            key={room.id}
                            onClick={() => handleRoomTypeClick(room.name, room.id)}
                            className={`text-[12px] md:text-[13px] flex items-center gap-1 cursor-pointer 
                                border-b border-gray-200 pb-1 border-dashed transition-colors duration-200
                                ${selectedRoomType === room.id
                                    ? 'text-red-500 font-semibold'
                                    : 'text-gray-600 hover:text-red-500'
                                }`}
                        >
                            <MdNavigateNext size={12} className="md:w-4 md:h-4" />
                            {room.name}
                        </p>
                    ))}
                </div>
            </div>

            {/* Price Range Section */}
            <div className="w-full bg-white mb-3 md:mb-4 rounded-xl border border-gray-300 p-3 md:p-5 shadow-xl mt-3 md:mt-4">
                <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4 border-b-2 border-gray-300 pb-2">
                    Xem theo giá
                </h3>
                <div className="flex flex-col gap-1 md:gap-2">
                    {priceRanges.map((range, index) => (
                        <p
                            key={index}
                            onClick={() => handlePriceClick(range.min, range.max, index)}
                            className={`text-[12px] md:text-[13px] flex items-center gap-1 cursor-pointer 
                                border-b border-gray-200 pb-1 border-dashed transition-colors duration-200
                                ${selectedPriceRange === index
                                    ? 'text-red-600 font-semibold'
                                    : 'text-gray-600 hover:text-red-600'
                                }`}
                        >
                            <MdNavigateNext size={12} className="md:w-4 md:h-4" />
                            {range.label}
                        </p>
                    ))}
                </div>
            </div>

            {/* Area Range Section */}
            <div className="w-full bg-white mb-3 md:mb-5 rounded-xl border border-gray-300 p-3 md:p-5 shadow-xl">
                <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4 border-b-2 border-gray-300 pb-2">
                    Xem theo diện tích
                </h3>
                <div className="flex flex-col gap-1 md:gap-2">
                    {areaRanges.map((range, index) => (
                        <p
                            key={index}
                            onClick={() => handleAreaClick(range.min, range.max, index)}
                            className={`text-[12px] md:text-[13px] flex items-center gap-1 cursor-pointer 
                                border-b border-gray-200 pb-1 border-dashed transition-colors duration-200
                                ${selectedAreaRange === index
                                    ? 'text-red-600 font-semibold'
                                    : 'text-gray-600 hover:text-red-600'
                                }`}
                        >
                            <MdNavigateNext size={12} className="md:w-4 md:h-4" />
                            {range.label}
                        </p>
                    ))}
                </div>
            </div>

            {/* Recent Posts Section */}
            <div className="w-full bg-white mb-3 md:mb-5 rounded-xl border border-gray-300 p-3 md:p-5 shadow-xl">
                <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4 border-b-2 border-gray-300 pb-2">
                    Tin mới đăng
                </h3>
                <NewPost />
            </div>
        </>
    );
};

export default memo(Sidebar);
