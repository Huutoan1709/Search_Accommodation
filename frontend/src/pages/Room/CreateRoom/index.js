import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { notifySuccess, notifyWarning } from '../../../components/ToastManager';
const CreateRoom = ({ onClose, showEdit }) => {
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
    const [amenitiesList, setAmenitiesList] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState([]); // Danh sách tỉnh/thành
    const [districts, setDistricts] = useState([]); // Danh sách quận/huyện
    const [wards, setWards] = useState([]); // Danh sách phường/xã
    const [errors, setErrors] = useState({});

    // Fetch cities on component mount
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('https://provinces.open-api.vn/api/p');
                const data = await response.json();
                setCities(data); // Cập nhật danh sách tỉnh/thành
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        };

        fetchCities();
    }, []);

    const handleCityChange = async (e) => {
        const selectedCityCode = e.target.value;
        const selectedCityName = e.target.options[e.target.selectedIndex].text;

        setFormData((prevData) => ({
            ...prevData,
            city: selectedCityCode, // Lưu mã số
            cityName: selectedCityName, // Lưu tên
        }));

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedCityCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
            setWards([]); // Clear wards on city change
        } catch (error) {
            console.error('Failed to fetch districts:', error);
        }
    };

    const handleDistrictChange = async (e) => {
        const selectedDistrictCode = e.target.value;
        const selectedDistrictName = e.target.options[e.target.selectedIndex].text;

        setFormData((prevData) => ({
            ...prevData,
            district: selectedDistrictCode, // Lưu mã số
            districtName: selectedDistrictName, // Lưu tên
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
        const selectedWardCode = e.target.value;
        const selectedWardName = e.target.options[e.target.selectedIndex].text;

        setFormData((prevData) => ({
            ...prevData,
            ward: selectedWardCode, // Lưu mã số
            wardName: selectedWardName, // Lưu tên
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = {
                ...formData,
                city: formData.cityName,
                district: formData.districtName,
                ward: formData.wardName,
            };
            await authApi().post(endpoints.room, dataToSend);
            notifySuccess('Tạo phòng thành công!');
            if (typeof onClose === 'function') {
                onClose();
            }
        } catch (error) {
            console.error('Failed to create room:', error);
            notifyWarning('Lỗi khi tạo phòng!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-[1100px] w-full relative">
                <button
                    className="absolute size-5 top-0 right-5 text-gray-500 hover:text-gray-800 text-[40px]"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h2 className="text-3xl font-semibold mb-4">{showEdit ? 'Chỉnh sửa phòng' : 'Tạo phòng mới'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700">Giá (triệu/tháng)</label>
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
                            <label className="block text-gray-700">Diện tích (m²)</label>
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
                            <label className="block text-gray-700">Tỉnh/Thành phố</label>
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
                            <label className="block text-gray-700">Quận/Huyện</label>
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
                            <label className="block text-gray-700">Phường/Xã</label>
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
                            <label className="block text-gray-700">Số nhà, tên đường</label>
                            <input
                                type="text"
                                name="other_address"
                                value={formData.other_address}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Vd: Số 10, Đường 3"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700">Kinh độ</label>
                            <input
                                type="text"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Vd: 106.682"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Vĩ độ</label>
                            <input
                                type="text"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Vd: 10.762"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700">Loại phòng</label>
                            <select
                                name="room_type"
                                value={formData.room_type}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                            >
                                <option value="">Chọn loại phòng</option>
                                {roomTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700">Tiện nghi</label>
                            {amenitiesList.map((amenity) => (
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
                    <div className="flex justify-between">
                        <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo phòng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoom;
