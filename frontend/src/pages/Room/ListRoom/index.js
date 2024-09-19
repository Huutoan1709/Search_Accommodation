import React, { useEffect, useState } from 'react';
import API, { endpoints } from '../../../API';

function Room() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await API.get(endpoints['room']);
                setData(result.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {data &&
                Array.isArray(data.results) &&
                data.results.map((item) => (
                    <div key={item.id}>
                        <p>ID: {item.id}</p>
                        <p>Price: {item.price}</p>
                        <p>Ward: {item.ward}</p>
                        <p>District: {item.district}</p>
                        <p>City: {item.city}</p>
                        <p>Other Address: {item.other_address}</p>
                        <p>Area: {item.area}</p>
                        <p>Landlord: {item.landlord}</p>
                    </div>
                ))}
        </div>
    );
}

export default Room;
