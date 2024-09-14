import React, { memo, useState, useEffect } from 'react';
import { MdNavigateNext } from 'react-icons/md';
import API, { endpoints } from '../../API';
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
    return (
        <div className="p-4 rounded-md bg-[#fff] w-full shadow-2xl   ">
            <h3 className="text-3xl font-semibold mb-4">DANH SÁCH CHO THUÊ</h3>
            <div className="flex flex-col gap-2 hover ">
                {roomtype.map((roomtype) => (
                    <p
                        key={roomtype.id}
                        className="flex items-center gap-1 text-gray-600 text-2xl hover:text-orange-600 cursor-pointer border-b border-gray-200 pb-1 border-dashed"
                    >
                        <MdNavigateNext size={10} /> Cho thuê {roomtype.name}
                    </p>
                ))}
            </div>
        </div>
    );
    // return (
    //     <div className="p-4 rounded-md bg-[#fff] w-full   ">
    //         <h3 className="text-lg font-semibold">DANH SÁCH CHO THUÊ</h3>
    //         <p className="flex items-center gap-1">
    //             <MdNavigateNext size={10} /> Cho thuê căn hộ
    //         </p>
    //         <p className="flex items-center gap-1">
    //             <MdNavigateNext size={10} /> Cho thuê nhà nguyên căn
    //         </p>
    //         <p className="flex items-center gap-1">
    //             <MdNavigateNext size={10} /> Cho thuê phòng trọ
    //         </p>
    //     </div>
    // );
};

export default memo(Sidebar);
