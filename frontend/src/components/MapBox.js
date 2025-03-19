import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import { FaMapMarkerAlt } from 'react-icons/fa';

function MapBox({ latitude, longitude, onCoordinatesChange }) {
    const [viewport, setViewport] = useState({
        width: '100%',
        height: '100vh',
        latitude: latitude || 21.0244246,
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

    const handleMapClick = (event) => {
        const { lng, lat } = event.lngLat;
        if (onCoordinatesChange) {
            onCoordinatesChange(lat, lng);
        }
        setViewport((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
        }));
    };

    return (
        <div className="w-full h-full absolute inset-0">
            <ReactMapGL
                {...viewport}
                onMove={(evt) => {
                    // Chỉ cập nhật viewport, không thay đổi tọa độ của marker
                    setViewport(evt.viewState);
                }}
                onClick={handleMapClick} // Sự kiện click để cập nhật vị trí marker
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken="pk.eyJ1IjoiaHV1dG9hbjE3MDkiLCJhIjoiY204Y2lsZ20wMTg0ODJrb2xrM3RkbWI1MCJ9.78vKIOvNFkWeyR6IEB1W2w"
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
