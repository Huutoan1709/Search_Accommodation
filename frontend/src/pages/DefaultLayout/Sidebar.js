import React, { memo, useState, useEffect } from 'react';
import { MdNavigateNext } from 'react-icons/md';
import API, { endpoints } from '../../API';
import NewPost from '././NewPost';

const Sidebar = () => {
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

    const priceRanges = [
        'Dưới 1 triệu',
        'Từ 1 - 2 triệu',
        'Từ 2 - 3 triệu',
        'Từ 3 - 5 triệu',
        'Từ 5 - 7 triệu',
        'Từ 7 - 10 triệu',
        'Từ 10 - 15 triệu',
        'Trên 15 triệu',
    ];

    const areaRanges = ['Dưới 20 m²', 'Từ 20 - 30 m²', 'Từ 30 - 50 m²', 'Từ 50 - 70 m²', 'Từ 70 - 90 m²', 'Trên 90 m²'];

    return (
        <>
            <div className="w-full bg-[#fff] rounded-xl border border-gray-300 p-5 shadow-xl">
                <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">Danh mục cho thuê</h3>
                <div className="flex flex-col gap-2">
                    {roomtype.map((roomtype) => (
                        <p
                            key={roomtype.id}
                            className="flex items-center gap-1 text-gray-600 text-xl hover:text-orange-600 cursor-pointer border-b border-gray-200 pb-1 border-dashed"
                        >
                            <MdNavigateNext size={14} /> Cho thuê {roomtype.name}
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
                            className="flex items-center gap-1 text-gray-600 text-xl hover:text-orange-600 cursor-pointer border-b border-gray-200 pb-1 border-dashed"
                        >
                            <MdNavigateNext size={14} /> {range}
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
                            className="flex items-center gap-1 text-gray-600 text-xl hover:text-orange-600 cursor-pointer border-b border-gray-200 pb-1 border-dashed"
                        >
                            <MdNavigateNext size={14} /> {range}
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
