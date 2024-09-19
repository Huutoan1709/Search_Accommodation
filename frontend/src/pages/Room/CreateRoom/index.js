import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';

const CreateRoom = ({ onClose }) => {
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
                    ? [...prevData.amenities, Number(value)] // Ensure value is a number
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
            await authApi().post(endpoints.room, formData);
            alert('Tạo phòng thành công!');
            if (typeof onClose === 'function') {
                onClose();
            }
        } catch (error) {
            console.error('Failed to create room:', error);
            alert('Lỗi!!!!!!!.');
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
                <h2 className="text-3xl font-semibold mb-4">Tạo phòng mới</h2>
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
                            <label className="block text-gray-700">Phường/Xã</label>
                            <input
                                type="text"
                                name="ward"
                                value={formData.ward}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Vd: Phường Linh Tây"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Quận/Huyện</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Vd: Quận Thủ Đức"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700">Tỉnh/Thành phố</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                                placeholder="Vd: TP.Hồ Chí Minh"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Địa chỉ khác</label>
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
                            <label className="block text-gray-700">Latitude</label>
                            <input
                                type="number"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Longitude</label>
                            <input
                                type="number"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded w-full"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nội Thất</label>
                        {amenitiesList.map((amenity) => (
                            <div key={amenity.id} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    value={amenity.id}
                                    checked={formData.amenities.includes(amenity.id)} // Ensure checking is done correctly
                                    onChange={handleChange}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2">{amenity.name}</label>
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoom;
