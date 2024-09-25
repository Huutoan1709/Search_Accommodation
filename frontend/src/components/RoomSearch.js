import React, { useState } from 'react';
import axios from 'axios';

const RoomSearch = ({ setRooms }) => {
    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get('http://127.0.0.1:8000/room/', {
                params: {
                    city: city,
                    min_price: minPrice,
                    max_price: maxPrice,
                },
            });
            setRooms(response.data); // Cập nhật danh sách phòng với dữ liệu từ API
        } catch (error) {
            console.error('Error fetching rooms', error);
        }
    };

    return (
        <form onSubmit={handleSearch}>
            <div>
                <label>City:</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" />
            </div>
            <div>
                <label>Min Price:</label>
                <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min price"
                />
            </div>
            <div>
                <label>Max Price:</label>
                <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max price"
                />
            </div>
            <button type="submit">Search</button>
        </form>
    );
};

export default RoomSearch;
