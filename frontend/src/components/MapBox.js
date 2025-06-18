import React, { useState, useEffect, useRef } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import { FaMapMarkerAlt } from 'react-icons/fa';

function MapBox({ latitude, longitude, onCoordinatesChange }) {
    const mapRef = useRef(null);

    const [viewport, setViewport] = useState({
        width: '100%',
        height: '100%', // Changed from 100vh to 100%
        latitude: latitude || 21.0244246,
        longitude: longitude || 105.84117,
        zoom: 14,
    });

    // Add responsive zoom levels
    const getResponsiveZoom = () => {
        if (window.innerWidth < 640) return 13; // Mobile
        if (window.innerWidth < 768) return 13.5; // Tablet
        return 14; // Desktop
    };

    useEffect(() => {
        setViewport((prev) => ({
            ...prev,
            latitude: latitude || prev.latitude,
            longitude: longitude || prev.longitude,
            zoom: getResponsiveZoom(),
        }));

        // Handle resize
        const handleResize = () => {
            setViewport((prev) => ({
                ...prev,
                zoom: getResponsiveZoom(),
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                ref={mapRef}
                {...viewport}
                onMove={(evt) => setViewport(evt.viewState)}
                onClick={handleMapClick}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken="pk.eyJ1IjoiaHV1dG9hbjE3MDkiLCJhIjoiY204Y2lsZ20wMTg0ODJrb2xrM3RkbWI1MCJ9.78vKIOvNFkWeyR6IEB1W2w"
                scrollZoom={{
                    speed: 0.5,
                    smooth: true
                }}
                dragPan={true}
                dragRotate={true}
                touchZoom={true}
                touchRotate={true}
                keyboard={true}
                doubleClickZoom={true}
                minZoom={5}
                maxZoom={18}
                interactive={true}
            >
                <Marker 
                    latitude={latitude} 
                    longitude={longitude}
                    anchor="bottom"
                >
                    <div className="relative group">
                        <FaMapMarkerAlt 
                            size={window.innerWidth < 640 ? 20 : 25} 
                            color="red" 
                            className="shadow-lg transform-gpu transition-transform duration-200 hover:scale-110"
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-xs sm:text-sm">
                            Vị trí hiện tại
                        </div>
                    </div>
                </Marker>
            </ReactMapGL>
        </div>
    );
}

export default MapBox;
