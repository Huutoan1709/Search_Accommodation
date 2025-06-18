import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import MapBox from '../../components/MapBox';
import { notifyWarning } from '../../components/ToastManager';
import removeAccents from 'remove-accents';
import { BiSearch } from 'react-icons/bi';

function LocationSearch({ onClose, onSubmit }) {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [radius, setRadius] = useState(5); // Default 5km radius
    const [formData, setFormData] = useState({
        city: '',
        cityName: '',
        district: '',
        districtName: '',
        latitude: null,
        longitude: null,
    });

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('https://provinces.open-api.vn/api/p');
                const data = await response.json();
                setCities(data);
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        };
        fetchCities();
    }, []);

    const handleCityChange = async (e) => {
        const selectedCityCode = e.target.value;
        const selectedCityName = e.target.options[e.target.selectedIndex]?.text;
        setFormData((prevData) => ({
            ...prevData,
            city: selectedCityCode,
            cityName: selectedCityName,
            district: '',
            districtName: '',
            latitude: null,
            longitude: null,
        }));

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedCityCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
        } catch (error) {
            console.error('Failed to fetch districts:', error);
        }
    };

    const handleDistrictChange = (e) => {
        const selectedDistrictCode = e.target.value;
        const selectedDistrictName = e.target.options[e.target.selectedIndex]?.text;
        setFormData((prevData) => ({
            ...prevData,
            district: selectedDistrictCode,
            districtName: selectedDistrictName,
            latitude: null,
            longitude: null,
        }));
    };

    const debouncedHandleGeocode = debounce(async () => {
        const { districtName, cityName } = formData;

        const address = removeAccents(`${districtName}, ${cityName}`);

        const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            address,
        )}.json?access_token=pk.eyJ1IjoiaHV1dG9hbjE3MDkiLCJhIjoiY204Y2lsZ20wMTg0ODJrb2xrM3RkbWI1MCJ9.78vKIOvNFkWeyR6IEB1W2w`;

        try {
            const response = await fetch(geocodingUrl);
            const data = await response.json();
            const { features } = data;

            if (features.length > 0) {
                const [longitude, latitude] = features[0].center;
                setFormData((prevData) => ({
                    ...prevData,
                    latitude,
                    longitude,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch geocoding data:', error);
            notifyWarning('Lỗi khi lấy tọa độ.');
        }
    }, 500);

    useEffect(() => {
        debouncedHandleGeocode();
    }, [formData.districtName, formData.cityName]);

    // Tính toán khoảng cách tìm kiếm xung quanh dựa trên bán kính
    const getSearchCoordinates = (latitude, longitude) => {
        if (latitude && longitude) {
            // Convert radius from km to degrees (approximately)
            const radiusDegrees = radius * 0.008; // 1km ≈ 0.008 degrees
            const latMin = latitude - radiusDegrees;
            const latMax = latitude + radiusDegrees;
            const lonMin = longitude - radiusDegrees;
            const lonMax = longitude + radiusDegrees;

            return { latMin, latMax, lonMin, lonMax };
        }
        return null;
    };

    const handleSubmit = () => {
        const coordinates = getSearchCoordinates(formData.latitude, formData.longitude);

        if (coordinates) {
            const searchParams = {
                ...formData,
                latMin: coordinates.latMin,
                latMax: coordinates.latMax,
                lonMin: coordinates.lonMin,
                lonMax: coordinates.lonMax,
                radius: radius, // Include selected radius in search params
            };
            onSubmit(searchParams);
            onClose();
        } else {
            notifyWarning('Vui lòng chọn vị trí trên bản đồ.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full sm:w-[90%] md:w-[800px] my-4 md:my-0 max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
                <div className="location-search-container p-3 md:p-4 space-y-3 md:space-y-4">
                    {/* Header Section - Reduced spacing on mobile */}
                    <h3 className="text-center font-semibold text-lg md:text-[20px] mt-1 md:mt-4">
                        Tìm kiếm xung quanh
                    </h3>
                    <span className="block text-center text-gray-600 text-base md:text-[15px]">
                        Tìm kiếm phòng trọ xung quanh theo bán kính tại vị trí lựa chọn
                    </span>

                    {/* Form Groups - Tighter spacing on mobile */}
                    <div className="space-y-3 md:space-y-4">
                        {/* City Selection */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-base md:text-base mb-1">
                                Chọn Tỉnh
                            </label>
                            <select
                                className="w-full px-2 py-1.5 md:px-4 md:py-2 border rounded-md text-sm md:text-base
                                         focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={handleCityChange}
                            >
                                <option value="">Chọn tỉnh</option>
                                {cities.map((city) => (
                                    <option key={city.code} value={city.code}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* District Selection */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-lg md:text-base mb-1">
                                Chọn Quận/Huyện
                            </label>
                            <select
                                className="w-full px-2 py-1.5 md:px-4 md:py-2 border rounded-md text-sm md:text-base
                                         focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={handleDistrictChange}
                            >
                                <option value="">Chọn quận/huyện</option>
                                {districts.map((district) => (
                                    <option key={district.code} value={district.code}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Radius Selection - Compact on mobile */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-lg md:text-base mb-1">
                                Bán kính tìm kiếm
                            </label>
                            <div className="flex flex-wrap gap-1.5 md:gap-2 mt-1 md:mt-2">
                                {[5, 10, 15].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRadius(r)}
                                        className={`px-2 py-1 md:px-4 md:py-2 rounded-md text-xs md:text-base
                                            ${radius === r 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                    >
                                        {r}km
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Map Container - Shorter on mobile */}
                        <div className='border-2 border-gray-300 rounded-lg relative h-[180px] md:h-[300px]'>
                            <MapBox
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onCoordinatesChange={(lat, lng) => 
                                    setFormData({ ...formData, latitude: lat, longitude: lng })}
                            />
                        </div>

                        {/* Action Buttons - Compact on mobile */}
                        <div className="form-group flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center mt-3 md:mt-4">
                            <button 
                                onClick={handleSubmit} 
                                className="w-full md:w-auto px-4 py-1.5 md:px-6 md:py-2 bg-gray-800 text-white rounded-md
                                         text-sm md:text-base hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center justify-center">
                                    <BiSearch className="mr-1.5 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
                                    Tìm kiếm
                                </div>
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full md:w-auto px-4 py-1.5 md:px-6 md:py-2 bg-red-500 text-white rounded-md 
                                         text-sm md:text-base hover:bg-red-600 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LocationSearch;
