import React, { useEffect, useState } from 'react';
import Home from './index';
import API, { endpoints } from '../../API';

const NhaNguyenCan = () => {
    const [roomType, setRoomType] = useState('');

    useEffect(() => {
        const fetchRoomType = async () => {
            try {
                let res = await API.get(endpoints['roomtype']);
                const nhaNguyenCanType = res.data.find((type) => type.name === 'Nhà nguyên căn');
                setRoomType(nhaNguyenCanType ? nhaNguyenCanType.name : '');
            } catch (err) {
                console.error('Failed to fetch room types:', err);
            }
        };
        fetchRoomType();
    }, []);
    console.log('đây là:', roomType);

    if (!roomType) {
        return <div>Loading...</div>;
    }

    return <Home room_type={roomType} />;
};

export default NhaNguyenCan;
