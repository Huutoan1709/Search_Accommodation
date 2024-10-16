import React, { useState, useEffect } from 'react';
import API, { endpoints } from '../API';
import { notifyError } from '../components/ToastManager';
function Modal({ field, setIsModal, handleApply }) {
    const [selected, setSelected] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minArea, setMinArea] = useState('');
    const [maxArea, setMaxArea] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');
    const [selectedDistrictName, setSelectedDistrictName] = useState('');
    const [selectedWardName, setSelectedWardName] = useState('');
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [roomTypeOptions, setRoomTypeOptions] = useState([]);

    useEffect(() => {
        if (field === 'area') {
            setSelected('Tất cả diện tích');
            setMinArea('');
            setMaxArea('');
        } else if (field === 'price') {
            setSelected('Tất cả mức giá');
            setMinPrice('');
            setMaxPrice('');
        }
    }, [field]);

    useEffect(() => {
        if (field === 'region') {
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
        }
    }, [field]);

    useEffect(() => {
        if (field === 'room_type') {
            const fetchRoomTypes = async () => {
                try {
                    let res = await API.get(endpoints['roomtype']);
                    if (Array.isArray(res.data)) {
                        setRoomTypeOptions(res.data);
                    } else {
                        setRoomTypeOptions([]);
                    }
                } catch (error) {
                    console.error('Failed to fetch room types:', error);
                }
            };
            fetchRoomTypes();
        }
    }, [field]);

    const handleCityChange = async (e) => {
        const selectedCityCode = e.target.value;
        const selectedCityName = e.target.options[e.target.selectedIndex]?.text;
        setSelectedCity(selectedCityCode);
        setSelectedCityName(selectedCityName);

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedCityCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
            setWards([]);
            setSelectedDistrict('');
            setSelectedWard('');
            setSelectedDistrictName('');
            setSelectedWardName('');
        } catch (error) {
            console.error('Failed to fetch districts:', error);
        }
    };

    const handleDistrictChange = async (e) => {
        const selectedDistrictCode = e.target.value;
        const selectedDistrictName = e.target.options[e.target.selectedIndex]?.text;
        setSelectedDistrict(selectedDistrictCode);
        setSelectedDistrictName(selectedDistrictName);

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`);
            const data = await response.json();
            setWards(data.wards);
            setSelectedWard('');
            setSelectedWardName('');
        } catch (error) {
            console.error('Failed to fetch wards:', error);
        }
    };

    const handleWardChange = (e) => {
        const selectedWardCode = e.target.value;
        const selectedWardName = e.target.options[e.target.selectedIndex]?.text;
        setSelectedWard(selectedWardCode);
        setSelectedWardName(selectedWardName);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let valid = true;

        if (field === 'price') {
            if (minPrice < 0 || maxPrice < 0 || (minPrice && maxPrice && Number(minPrice) > Number(maxPrice))) {
                valid = false;
                notifyError('Đảm bảo thông tin hợp lệ.');
            } else {
                handleApply(field, selected, minPrice, maxPrice);
            }
        } else if (field === 'area') {
            if (minArea < 0 || maxArea < 0 || (minArea && maxArea && Number(minArea) > Number(maxArea))) {
                valid = false;
            } else {
                handleApply(field, selected, minArea, maxArea);
            }
        } else if (field === 'region') {
            const selectedRange = {
                city: selectedCityName,
                district: selectedDistrictName,
                ward: selectedWardName,
            };
            handleApply(field, selectedRange);
        } else if (field === 'room_type') {
            handleApply(field, selected);
        }

        if (!valid) {
            setIsValid(false);
        } else {
            setIsValid(true);
            setIsModal(false); // Đóng modal chỉ khi thông tin hợp lệ
        }
    };

    return (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <form onSubmit={handleSubmit} className="modal-content bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
                <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 border-dashed text-center">
                    {field === 'region'
                        ? 'CHỌN KHU VỰC'
                        : field === 'price'
                        ? 'CHỌN MỨC GIÁ'
                        : field === 'area'
                        ? 'CHỌN DIỆN TÍCH'
                        : 'CHỌN LOẠI PHÒNG'}
                </h2>
                {field === 'room_type' && (
                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        className="border p-2 mb-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Chọn loại phòng</option>
                        {roomTypeOptions &&
                            Array.isArray(roomTypeOptions) &&
                            roomTypeOptions.map((room) => (
                                <option key={room.id} value={room.name}>
                                    {room.name}
                                </option>
                            ))}
                    </select>
                )}
                {field === 'region' && (
                    <>
                        <select
                            onChange={handleCityChange}
                            className="border p-2 mb-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Chọn tỉnh</option>
                            {cities.map((city) => (
                                <option key={city.code} value={city.code}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        <select
                            onChange={handleDistrictChange}
                            className="border p-2 mb-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Chọn quận</option>
                            {districts.map((district) => (
                                <option key={district.code} value={district.code}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                        <select
                            onChange={handleWardChange}
                            className="border p-2 mb-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Chọn phường</option>
                            {wards.map((ward) => (
                                <option key={ward.code} value={ward.code}>
                                    {ward.name}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                {field === 'price' && (
                    <>
                        <input
                            type="number"
                            placeholder="Giá từ"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="border p-2 mb-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                            type="number"
                            placeholder="Đến"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="border p-2 mb-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </>
                )}
                {field === 'area' && (
                    <>
                        <input
                            type="number"
                            placeholder="Diện tích từ"
                            value={minArea}
                            onChange={(e) => setMinArea(e.target.value)}
                            className="border p-2 mb-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                            type="number"
                            placeholder="Đến"
                            value={maxArea}
                            onChange={(e) => setMaxArea(e.target.value)}
                            className="border p-2 mb-4 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </>
                )}
                {!isValid && <p className="text-red-500 text-xl mb-4">Vui lòng nhập thông tin hợp lệ.</p>}
                <div className="flex justify-between mt-4">
                    <button
                        type="button"
                        onClick={() => setIsModal(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                        Huỷ
                    </button>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Áp dụng
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Modal;
