import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import { FaMapMarkerAlt } from 'react-icons/fa';

function MapBox({ latitude, longitude, onCoordinatesChange }) {
    const [viewport, setViewport] = useState({
        width: '100%', // Chỉnh width
        height: '300px', // Đảm bảo chiều cao
        latitude: latitude || 21.0244246,
        longitude: longitude || 105.84117,
        zoom: 14,
    });

    // Cập nhật tọa độ nếu nhận được props mới
    useEffect(() => {
        setViewport((prev) => ({
            ...prev,
            latitude: latitude || prev.latitude,
            longitude: longitude || prev.longitude,
        }));
    }, [latitude, longitude]);

    const handleMapClick = (event) => {
        const { lng, lat } = event.lngLat; // Lấy tọa độ từ object
        if (onCoordinatesChange) {
            onCoordinatesChange(lat, lng); // Gọi callback để cập nhật tọa độ trong CreateRoom
        }
        setViewport((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng, // Cập nhật vị trí cho marker mới
        }));
    };

    return (
        <div className="w-full h-[300px]">
            <ReactMapGL
                {...viewport}
                onMove={(evt) => {
                    // Chỉ cập nhật viewport, không thay đổi tọa độ của marker
                    setViewport(evt.viewState);
                }}
                onClick={handleMapClick} // Sự kiện click để cập nhật vị trí marker
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken="pk.eyJ1Ijoibmd1eWVuaHV1dG9hbjAxMCIsImEiOiJjbTFnZ29xMjEwM3BwMm5wc3I4a2QyY2RiIn0.MMx3-MfuaAGJ1W7dmejE3A"
                scrollZoom={true}
                dragPan={true}
                dragRotate={true}
                interactive={true}
            >
                {/* Marker chỉ theo tọa độ latitude và longitude */}
                <Marker latitude={latitude} longitude={longitude}>
                    <FaMapMarkerAlt size={25} color="red" className="shadow-2xl" />
                </Marker>
            </ReactMapGL>
        </div>
    );
}

export default MapBox;
