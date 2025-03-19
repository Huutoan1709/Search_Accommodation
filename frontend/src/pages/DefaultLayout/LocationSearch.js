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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
                <div className="location-search-container p-4 space-y-4">
                    <h3 className="flex items-center justify-center font-semibold text-[20px] mt-4">Tìm kiếm xung quanh</h3>
                    <span className="flex items-center justify-center text-gray-600 text-[15px]">Tìm kiếm phòng trọ xung quanh theo bán kính tại vị trí lựa chọn</span>
                    <div className="form-group">
                        <label className="block text-gray-700">Chọn Tỉnh</label>
                        <select
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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

                    <div className="form-group">
                        <label className="block text-gray-700">Chọn Quận/Huyện</label>
                        <select
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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

                    <div className="form-group">
                        <label className="block text-gray-700">Bán kính tìm kiếm</label>
                        <div className="flex gap-2 mt-2">
                            {[5, 10, 15].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRadius(r)}
                                    className={`px-4 py-2 rounded-md ${
                                        radius === r
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                >
                                    {r}km
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='border-2 border-gray-300 rounded-lg relative h-[300px]'>
                        <MapBox
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onCoordinatesChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                        />
                    </div>

                    <div className="form-group space-x-4 mt-4 flex justify-center items-center">
                        <button onClick={handleSubmit} className="px-6 py-2 bg-gray-800 text-white rounded-md">
                            <div className="flex items-center">
                                <BiSearch className="mr-2" />
                                Tìm kiếm
                            </div>
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LocationSearch;
