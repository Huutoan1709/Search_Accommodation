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
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                type="button"
                                onClick={() => {setMinPrice(0); setMaxPrice(1)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                Dưới 1 triệu
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinPrice(1); setMaxPrice(3)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                1 - 3 triệu
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinPrice(3); setMaxPrice(5)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                3 - 5 triệu
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinPrice(5); setMaxPrice(7)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                5 - 7 triệu
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinPrice(7); setMaxPrice(10)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                7 - 10 triệu
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinPrice(11); setMaxPrice()}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                Trên 10 triệu
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between mb-4">
                                <span className="font-medium">{minPrice?.toLocaleString('vi-VN')} triệu </span>
                                <span className="font-medium">{maxPrice?.toLocaleString('vi-VN')} triệu</span>
                            </div>
                            <div className="relative h-12">
                                <div className="absolute w-full h-1 bg-gray-200 rounded-lg top-1/2 transform -translate-y-1/2"></div>
                                <div 
                                    className="absolute h-1 bg-green-500 rounded-lg top-1/2 transform -translate-y-1/2"
                                    style={{
                                        left: `${(minPrice / 30) * 100}%`,
                                        right: `${100 - ((maxPrice / 30) * 100)}%`
                                    }}
                                ></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(Number(e.target.value))}
                                    className="absolute top-0 w-full h-6 appearance-none"
                                    style={{
                                        WebkitAppearance: 'none',
                                        background: 'transparent',
                                    }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="absolute bottom-0 w-full h-6 appearance-none"
                                    style={{
                                        WebkitAppearance: 'none',
                                        background: 'transparent',
                                    }}
                                />
                                <style>
                                    {`
                                    input[type="range"]::-webkit-slider-thumb {
                                        -webkit-appearance: none;
                                        height: 20px;
                                        width: 20px;
                                        border-radius: 50%;
                                        background: #22C55E;
                                        cursor: pointer;
                                        border: 2px solid white;
                                        box-shadow: 0 0 2px rgba(0,0,0,0.2);
                                    }
                                    input[type="range"] {
                                        pointer-events: auto;
                                    }
                                    `}
                                </style>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <input
                                type="number"
                                placeholder="Giá từ"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Number(e.target.value))}
                                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                            />
                            <input
                                type="number"
                                placeholder="Đến"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                            />
                        </div>
                    </>
                )}
                {field === 'area' && (
                    <>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                type="button"
                                onClick={() => {setMinArea(0); setMaxArea(20)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                Dưới 20m²
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinArea(20); setMaxArea(30)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                20 - 30m²
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinArea(30); setMaxArea(50)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                30 - 50m²
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinArea(50); setMaxArea(70)}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                50 - 70m²
                            </button>
                            <button
                                type="button"
                                onClick={() => {setMinArea(70); setMaxArea()}}
                                className="px-4 py-2 text-xl border rounded-full hover:bg-green-50 hover:border-green-500 transition duration-200"
                            >
                                Trên 70m²
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between mb-4">
                                <span className="font-medium">{minArea} m² </span>
                                <span className="font-medium">{maxArea} m²</span>
                            </div>
                            <div className="relative h-12">
                                <div className="absolute w-full h-1 bg-gray-200 rounded-lg top-1/2 transform -translate-y-1/2"></div>
                                <div 
                                    className="absolute h-1 bg-green-500 rounded-lg top-1/2 transform -translate-y-1/2"
                                    style={{
                                        left: `${(minArea / 100) * 100}%`,
                                        right: `${100 - ((maxArea / 100) * 100)}%`
                                    }}
                                ></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={minArea}
                                    onChange={(e) => setMinArea(Number(e.target.value))}
                                    className="absolute top-0 w-full h-6 appearance-none"
                                    style={{
                                        WebkitAppearance: 'none',
                                        background: 'transparent',
                                    }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={maxArea}
                                    onChange={(e) => setMaxArea(Number(e.target.value))}
                                    className="absolute bottom-0 w-full h-6 appearance-none"
                                    style={{
                                        WebkitAppearance: 'none',
                                        background: 'transparent',
                                    }}
                                />
                                <style>
                                    {`
                                    input[type="range"]::-webkit-slider-thumb {
                                        -webkit-appearance: none;
                                        height: 20px;
                                        width: 20px;
                                        border-radius: 50%;
                                        background: #22C55E;
                                        cursor: pointer;
                                        border: 2px solid white;
                                        box-shadow: 0 0 2px rgba(0,0,0,0.2);
                                    }
                                    input[type="range"] {
                                        pointer-events: auto;
                                    }
                                    `}
                                </style>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <input
                                type="number"
                                placeholder="Diện tích từ"
                                value={minArea}
                                onChange={(e) => setMinArea(Number(e.target.value))}
                                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                            />
                            <input
                                type="number"
                                placeholder="Đến"
                                value={maxArea}
                                onChange={(e) => setMaxArea(Number(e.target.value))}
                                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                            />
                        </div>
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
