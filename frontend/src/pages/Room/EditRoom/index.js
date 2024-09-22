import CreateRoom from '../CreateRoom';
import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';

const EditRoom = ({ roomId, onClose }) => {
    const [roomData, setRoomData] = useState(null);

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await authApi().get(`${endpoints.myrooms}`);
                const room = response.data.find((room) => room.id === roomId);
                setRoomData(room);
            } catch (error) {
                console.error('Failed to fetch room data:', error);
            }
        };

        if (roomId) {
            fetchRoomData();
        }
    }, [roomId]);

    //Fetch được data chi tiết của từng thằng.
    return <CreateRoom showEdit roomData={roomData} />;
};

export default EditRoom;
