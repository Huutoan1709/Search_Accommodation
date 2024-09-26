import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import { FaMapMarkerAlt } from 'react-icons/fa';
function MapBox({ latitude, longitude, onViewportChange }) {
    const [viewport, setViewport] = useState({
        width: '100%',
        height: '100%',
        latitude: latitude || 21.0244246, // Giá trị mặc định nếu không có props
        longitude: longitude || 105.84117,
        zoom: 14,
    });

    useEffect(() => {
        setViewport((prev) => ({
            ...prev,
            latitude: latitude || prev.latitude,
            longitude: longitude || prev.longitude,
        }));
    }, [latitude, longitude]);

    return (
        <div className="w-full h-[300px]">
            <ReactMapGL
                {...viewport}
                onViewportChange={(viewport) => {
                    setViewport(viewport);
                }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken="pk.eyJ1Ijoibmd1eWVuaHV1dG9hbjAxMCIsImEiOiJjbTFnZ29xMjEwM3BwMm5wc3I4a2QyY2RiIn0.MMx3-MfuaAGJ1W7dmejE3A"
            >
                <Marker latitude={viewport.latitude} longitude={viewport.longitude}>
                    <FaMapMarkerAlt size={30} color="red" className="shadow-2xl" />
                </Marker>
            </ReactMapGL>
        </div>
    );
}

export default MapBox;
