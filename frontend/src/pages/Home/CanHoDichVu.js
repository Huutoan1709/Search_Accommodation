import React, { useEffect, useState } from 'react';
import Home from './index';
import API, { endpoints } from '../../API';

const CanHoDichVu = () => {
    const [roomType, setRoomType] = useState('');

    useEffect(() => {
        const fetchRoomType = async () => {
            try {
                let res = await API.get(endpoints['roomtype']);
                const canHoDichVuType = res.data.find((type) => type.name === 'Căn hộ dịch vụ');
                setRoomType(canHoDichVuType ? canHoDichVuType.name : '');
            } catch (err) {
                console.error('Failed to fetch room types:', err);
            }
        };
        fetchRoomType();
    }, []);

    if (!roomType) {
        return <div>Loading...</div>;
    }

    return <Home room_type={roomType} />;
};

export default CanHoDichVu;
