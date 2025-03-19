import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { notifySuccess, notifyWarning } from '../../../components/ToastManager';
import ReactMapGL, { Marker } from 'react-map-gl';
import MapBox from '../../../components/MapBox';
import axios from 'axios';
import removeAccents from 'remove-accents';
import debounce from 'lodash.debounce';
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
        )}.json?access_token=pk.eyJ1IjoiaHV1dG9hbjE3MDkiLCJhIjoiY204Y2lsZ20wMTg0ODJrb2xrM3RkbWI1MCJ9.78vKIOvNFkWeyR6IEB1W2w`;

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
        const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1Ijoibmd1eWVuaHV1dG9hbjAxMCIsImEiOiJjbTFnZ29xMjEwM3BwMm5wc3I4a2QyY2RiIn0.MMx3-MfuaAGJ1W7dmejE3A`;

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
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-[1100px] w-full mt-[200px]">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-semibold mb-4">{showEdit ? 'Chỉnh sửa phòng' : 'Tạo phòng mới'}</h2>
                    <h2
                        className="text-[20px] mb-3 font-semibold cursor-pointer text-gray-500 hover:text-gray-800"
                        onClick={onClose}
                    >
                        X
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-600 font-semibold">Giá (triệu/tháng)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Vd: 10, 3"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 font-semibold">Diện tích (m²)</label>
                            <input
                                type="number"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Vd: 30, 50"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-600 font-semibold">Tỉnh/Thành phố</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleCityChange}
                                className="border border-gray-300 p-2 rounded w-full"
                            >
                                <option value="">Chọn tỉnh/thành phố</option>
                                {cities.map((city) => (
                                    <option key={city.code} value={city.code}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 font-semibold">Quận/Huyện</label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleDistrictChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                disabled={!formData.city}
                            >
                                <option value="">Chọn quận/huyện</option>
                                {districts.map((district) => (
                                    <option key={district.code} value={district.code}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-600 font-semibold">Phường/Xã</label>
                            <select
                                name="ward"
                                value={formData.ward}
                                onChange={handleWardChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                disabled={!formData.district}
                            >
                                <option value="">Chọn phường/xã</option>
                                {wards.map((ward) => (
                                    <option key={ward.code} value={ward.code}>
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="other_address" className="text-gray-600 font-semibold">
                                Số nhà, tên đường
                            </label>
                            <input
                                type="text"
                                name="other_address"
                                id="other_address"
                                value={formData.other_address}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border rounded"
                                placeholder="Số nhà, tên đường"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-600 font-semibold">Kinh độ</label>
                            <input
                                type="text"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Tự động lấy hoặc chỉnh sửa"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 font-semibold">Vĩ độ</label>
                            <input
                                type="text"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Tự động lấy hoặc chỉnh sửa"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-600 font-semibold">Loại phòng</label>
                        <select
                            name="room_type"
                            value={formData.room_type}
                            onChange={handleChange}
                            disabled={showEdit}
                            className="border border-gray-300 p-2 rounded w-full"
                        >
                            <option value="" className="text-gray-600 font-semibold">
                                Chọn loại phòng
                            </option>
                            {roomTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-600 font-semibold">Nội thất</label>
                        <div className="grid grid-cols-2 gap-4">
                            {amenitiesList.slice(0, 10).map((amenity) => (
                                <label key={amenity.id} className="block">
                                    <input
                                        type="checkbox"
                                        name="amenities"
                                        value={amenity.id}
                                        checked={formData.amenities.includes(amenity.id)}
                                        onChange={handleChange}
                                    />
                                    {amenity.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className=" w-full h-[300px] relative">
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
                    <div className="flex justify-between mt-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={debouncedHandleGeocode}
                                className="bg-green-500 text-white px-4 py-2 rounded-md font-base"
                            >
                                Xem trên map
                            </button>
                            <button
                                type="submit"
                                className="bg-red-500 text-white px-4 py-2 rounded-md font-base"
                                disabled={loading}
                            >
                                {loading
                                    ? showEdit
                                        ? 'Đang cập nhật...'
                                        : 'Đang tạo...'
                                    : showEdit
                                    ? 'Cập nhật'
                                    : 'Tạo phòng'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoom;
