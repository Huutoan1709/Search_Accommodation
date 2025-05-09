import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { notifySuccess, notifyWarning } from '../../../components/ToastManager';
import ReactMapGL, { Marker } from 'react-map-gl';
import MapBox from '../../../components/MapBox';
import axios from 'axios';
import removeAccents from 'remove-accents';
import debounce from 'lodash.debounce';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_KEY;

const CreateRoom = ({ onClose, showEdit, roomData }) => {
    const [formData, setFormData] = useState({
        price: '',
        ward: '',
        district: '',
        city: '',
        other_address: '',
        area: '',
        room_type: '',
        latitude: '',
        longitude: '',
        amenities: [],
    });
    const [viewport, setViewport] = useState({
        latitude: roomData?.latitude || 10.762622,
        longitude: roomData?.longitude || 106.660172,
        zoom: 14,
    });

    const [amenitiesList, setAmenitiesList] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        if (roomData) {
            setFormData({
                price: roomData.price || '',
                ward: roomData.ward || '',
                district: roomData.district || '',
                city: roomData.city || '',
                other_address: roomData?.other_address || '',
                area: roomData?.area || '',
                room_type: roomData?.room_type?.id || '',
                latitude: roomData?.latitude || '',
                longitude: roomData?.longitude || '',
                amenities: roomData?.amenities || [],
            });
            setViewport({
                latitude: roomData?.latitude || 10.762622,
                longitude: roomData?.longitude || 106.660172,
                zoom: 18,
            });

            handleCityChange({ target: { value: roomData.city } });
            handleDistrictChange({ target: { value: roomData.district } });
        }
    }, [roomData]);

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
        if (!e.target || !e.target.options) return;

        const selectedCityCode = e.target.value;
        const selectedCityName = e.target.options[e.target.selectedIndex]?.text;

        setFormData((prevData) => ({
            ...prevData,
            city: selectedCityCode,
            cityName: selectedCityName,
        }));

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedCityCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
            setWards([]);
        } catch (error) {
            console.error('Failed to fetch districts:', error);
        }
    };

    const handleDistrictChange = async (e) => {
        if (!e.target || !e.target.options) return;

        const selectedDistrictCode = e.target.value;
        const selectedDistrictName = e.target.options[e.target.selectedIndex]?.text;

        setFormData((prevData) => ({
            ...prevData,
            district: selectedDistrictCode,
            districtName: selectedDistrictName,
        }));

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`);
            const data = await response.json();
            setWards(data.wards);
        } catch (error) {
            console.error('Failed to fetch wards:', error);
        }
    };

    const handleWardChange = (e) => {
        if (!e.target || !e.target.options || !e.target.selectedIndex) return;

        const selectedWardCode = e.target.value;
        const selectedWardName = e.target.options[e.target.selectedIndex].text;
        setFormData((prevData) => ({
            ...prevData,
            ward: selectedWardCode,
            wardName: selectedWardName,
        }));
    };

    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await authApi().get(endpoints.amenities);
                setAmenitiesList(response.data);
            } catch (error) {
                console.error('Failed to fetch amenities:', error);
            }
        };

        const fetchRoomTypes = async () => {
            try {
                const response = await authApi().get(endpoints.roomtype);
                setRoomTypes(response.data);
            } catch (error) {
                console.error('Failed to fetch room types:', error);
            }
        };

        fetchAmenities();
        fetchRoomTypes();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData((prevData) => ({
                ...prevData,
                amenities: checked
                    ? [...prevData.amenities, Number(value)]
                    : prevData.amenities.filter((item) => item !== Number(value)),
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
    const debouncedHandleGeocode = debounce(async () => {
        const { other_address, wardName, districtName, cityName } = formData;

        if (!other_address || !wardName || !districtName || !cityName) {
            notifyWarning('Vui lòng điền đầy đủ địa chỉ.');
            return;
        }

        // Loại bỏ dấu tiếng Việt
        const address = removeAccents(`${other_address}, ${wardName}, ${districtName}, ${cityName}`);

        const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            address,
        )}.json?access_token=pk.eyJ1IjoiaHV1dG9hbjE3MDkiLCJhIjoiY204Y2lsZ20wMTg0ODJrb2xrM3RkbWI1MCJ9.78vKIOvNFkWeyR6IEB1W2w
`;

        try {
            const response = await axios.get(geocodingUrl);
            const { features } = response.data;
            console.log('Geocoding data:', features);

            if (features.length > 0) {
                const [longitude, latitude] = features[0].center;
                setFormData((prevData) => ({
                    ...prevData,
                    latitude,
                    longitude,
                }));
                setViewport({
                    latitude,
                    longitude,
                    zoom: 18,
                });
            } else {
                notifyWarning('Không tìm thấy tọa độ cho địa chỉ này.');
            }
        } catch (error) {
            console.error('Failed to fetch geocoding data:', error);
            notifyWarning('Lỗi khi lấy tọa độ.');
        }
    }, 500);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.city || !formData.district || !formData.ward) {
                setLoading(false);
                notifyWarning('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã');
                return;
            }

            const dataToUpdate = {
                ...formData,
                city: formData.cityName,
                district: formData.districtName,
                ward: formData.wardName,
                room_type: { id: formData.room_type },
                amenities: formData.amenities,
            };

            const dataToCreate = {
                ...formData,
                city: formData.cityName,
                district: formData.districtName,
                ward: formData.wardName,
                room_type: formData.room_type,
                amenities: formData.amenities,
            };

            if (showEdit) {
                await authApi().patch(endpoints.updateroom(roomData.id), dataToUpdate);
                notifySuccess('Cập nhật phòng thành công!');
                window.location.reload();
            } else {
                await authApi().post(endpoints.room, dataToCreate);
                notifySuccess('Tạo phòng thành công!');
                window.location.reload();
            }

            if (typeof onClose === 'function') {
                onClose();
            }
        } catch (error) {
            if (error.response) {
                console.error('Response data:', error.response.data);
                notifyWarning(`Error: ${error.response.data.detail || 'Lỗi khi xử lý!'}`);
            } else {
                console.error('Failed to submit room:', error);
                notifyWarning('Lỗi khi xử lý!');
            }
        } finally {
            setLoading(false);
        }
    };
    const fetchAddressFromCoordinates = async (latitude, longitude) => {
        const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoiaHV1dG9hbjE3MDkiLCJhIjoiY204Y2lsZ20wMTg0ODJrb2xrM3RkbWI1MCJ9.78vKIOvNFkWeyR6IEB1W2w
`;

        try {
            const response = await axios.get(geocodingUrl);
            const { features } = response.data;
            if (features.length > 0) {
                const address = features[0].place_name;
                console.log('Địa chỉ:', address);
                // Bạn có thể cập nhật một state mới hoặc thông báo địa chỉ này
            } else {
                console.warn('Không tìm thấy địa chỉ cho tọa độ này.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy địa chỉ từ tọa độ:', error);
        }
    };

    // Theo dõi thay đổi tọa độ
    useEffect(() => {
        if (formData.latitude && formData.longitude) {
            fetchAddressFromCoordinates(formData.latitude, formData.longitude);
        }
    }, [formData.latitude, formData.longitude]);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto p-4 top-20">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1100px] my-8">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">
                            {showEdit ? 'Chỉnh sửa phòng' : 'Tạo phòng mới'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Price and Area Section */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xl font-medium text-gray-700">Giá (triệu/tháng)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Vd: 10, 3"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">triệu</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Diện tích (m²)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Vd: 30, 50"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">m²</span>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleCityChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {cities.map((city) => (
                                        <option key={city.code} value={city.code}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Quận/Huyện</label>
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={handleDistrictChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100"
                                    disabled={!formData.city}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map((district) => (
                                        <option key={district.code} value={district.code}>{district.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phường/Xã</label>
                                <select
                                    name="ward"
                                    value={formData.ward}
                                    onChange={handleWardChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100"
                                    disabled={!formData.district}
                                >
                                    <option value="">Chọn phường/xã</option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>{ward.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Street Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Số nhà, tên đường</label>
                            <input
                                type="text"
                                name="other_address"
                                value={formData.other_address}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="Nhập số nhà, tên đường"
                            />
                        </div>

                        {/* Room Type & Amenities */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Loại phòng</label>
                                <select
                                    name="room_type"
                                    value={formData.room_type}
                                    onChange={handleChange}
                                    disabled={showEdit}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100"
                                >
                                    <option value="">Chọn loại phòng</option>
                                    {roomTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nội thất</label>
                                <div className="grid grid-cols-2 gap-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                                    {amenitiesList.map((amenity) => (
                                        <label key={amenity.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="amenities"
                                                value={amenity.id}
                                                checked={formData.amenities.includes(amenity.id)}
                                                onChange={handleChange}
                                                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                            />
                                            <span className="text-sm text-gray-700">{amenity.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Vị trí trên bản đồ</label>
                            <div className="relative h-[300px] rounded-lg overflow-hidden border border-gray-300">
                                <MapBox
                                    latitude={formData.latitude}
                                    longitude={formData.longitude}
                                    onCoordinatesChange={(newLatitude, newLongitude) => {
                                        setFormData((prevData) => ({
                                            ...prevData,
                                            latitude: newLatitude,
                                            longitude: newLongitude,
                                        }));
                                    }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={debouncedHandleGeocode}
                                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Xem trên map
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-300"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {showEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
                                    </span>
                                ) : (
                                    showEdit ? 'Cập nhật' : 'Tạo phòng'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
