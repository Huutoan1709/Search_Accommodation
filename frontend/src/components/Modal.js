import React, { useState, useEffect } from 'react';

function Modal({ field, setIsModal, handleApply }) {
    const [selected, setSelected] = useState('Tất cả diện tích'); // Default value for area
    const [minPrice, setMinPrice] = useState(''); // Default min price
    const [maxPrice, setMaxPrice] = useState(''); // Default max price
    const [minArea, setMinArea] = useState(''); // Default min area
    const [maxArea, setMaxArea] = useState(''); // Default max area
    const [isValid, setIsValid] = useState(true); // Validation state
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const options = {
        area: [
            'Tất cả diện tích',
            'Dưới 20 m²',
            'Từ 20 - 30m²',
            'Từ 30 - 40m²',
            'Từ 40 - 60m²',
            'Từ 60 - 90 m²',
            'Trên 90 m²',
        ],
        price: [
            'Tất cả mức giá',
            'Dưới 1 triệu',
            'Từ 1 - 3 triệu',
            'Từ 3 - 5 triệu',
            'Từ 5 - 7 triệu',
            'Từ 7 - 10 triệu',
            'Trên 10 triệu',
        ],
    };

    // Reset giá trị khi thay đổi field
    useEffect(() => {
        if (field === 'area') {
            setSelected('Tất cả diện tích'); // Default for area
            setMinArea(''); // Reset min area
            setMaxArea(''); // Reset max area
        } else if (field === 'price') {
            setSelected('Tất cả mức giá'); // Default for price
            setMinPrice(''); // Reset min price
            setMaxPrice(''); // Reset max price
        }
    }, [field]);

    // Fetch cities khi field là 'region'
    useEffect(() => {
        if (field === 'region') {
            const fetchCities = async () => {
                try {
                    const response = await fetch('https://provinces.open-api.vn/api/p');
                    const data = await response.json();
                    setCities(data);
                    console.log(data);
                } catch (error) {
                    console.error('Failed to fetch cities:', error);
                }
            };
            fetchCities();
        }
    }, [field]);

    const handleCityChange = async (e) => {
        if (!e.target || !e.target.options) return;

        const selectedCityCode = e.target.value;
        const selectedCityName = e.target.options[e.target.selectedIndex]?.text;
        setSelectedCity(selectedCityCode);

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
        const selectedDistrictCode = e.target.value;
        setSelectedDistrict(selectedDistrictCode);

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
        setSelectedWard(selectedWardCode);
    };

    const handleCloseModal = () => {
        setIsModal(false);
    };

    const handleApplyChanges = () => {
        // Validate inputs for price
        if (field === 'price') {
            const min = parseFloat(minPrice);
            const max = parseFloat(maxPrice);
            if (min < 0 || max < 0 || (min && max && min > max)) {
                setIsValid(false);
                return;
            }
            let selectedRange;
            if (selected === 'Dưới 1 triệu') {
                selectedRange = 'Dưới 1 triệu';
            } else if (selected === 'Trên 10 triệu') {
                selectedRange = 'Trên 10 triệu';
            } else {
                selectedRange = min || max ? `Từ ${min || 0} triệu đến ${max || ''} triệu` : 'Tất cả mức giá';
            }

            handleApply(field, selectedRange, minPrice, maxPrice); // Pass the selected range
        }

        // Validate inputs for area
        else if (field === 'area') {
            const min = parseFloat(minArea);
            const max = parseFloat(maxArea);
            if (min < 0 || max < 0 || (min && max && min > max)) {
                setIsValid(false);
                return;
            }
            const selectedRange = min || max ? `Từ ${min || 0} m² đến ${max || ''} m²` : 'Tất cả diện tích';
            handleApply(field, selectedRange, minArea, maxArea); // Pass the selected range
        }

        // Validate inputs for region
        else if (field === 'region') {
            if (!selectedCity || !selectedDistrict || !selectedWard) {
                setIsValid(false);
                return;
            }
            const selectedRegion = {
                city: selectedCity,
                district: selectedDistrict,
                ward: selectedWard,
            };
            handleApply(field, selectedRegion); // Pass selectedRegion as an argument
        }

        setIsModal(false);
    };

    const handleRadioChange = (option) => {
        setSelected(option);
        // Update min/max fields based on selected option
        if (field === 'price') {
            switch (option) {
                case 'Dưới 1 triệu':
                    setMaxPrice('1');
                    setMinPrice('');
                    break;
                case 'Từ 1 - 3 triệu':
                    setMinPrice('1');
                    setMaxPrice('3');
                    break;
                case 'Từ 3 - 5 triệu':
                    setMinPrice('3');
                    setMaxPrice('5');
                    break;
                case 'Từ 5 - 7 triệu':
                    setMinPrice('5');
                    setMaxPrice('7');
                    break;
                case 'Từ 7 - 10 triệu':
                    setMinPrice('7');
                    setMaxPrice('10');
                    break;
                case 'Trên 10 triệu':
                    setMinPrice('10');
                    setMaxPrice('');
                    break;
                case 'Tất cả mức giá':
                default:
                    setMinPrice('');
                    setMaxPrice('');
                    break;
            }
        } else if (field === 'area') {
            switch (option) {
                case 'Dưới 20 m²':
                    setMaxArea('20');
                    setMinArea('');
                    break;
                case 'Từ 20 - 30m²':
                    setMinArea('20');
                    setMaxArea('30');
                    break;
                case 'Từ 30 - 40m²':
                    setMinArea('30');
                    setMaxArea('40');
                    break;
                case 'Từ 40 - 60m²':
                    setMinArea('40');
                    setMaxArea('60');
                    break;
                case 'Từ 60 - 90 m²':
                    setMinArea('60');
                    setMaxArea('90');
                    break;
                case 'Trên 90 m²':
                    setMinArea('90');
                    setMaxArea('');
                    break;
                case 'Tất cả diện tích':
                default:
                    setMinArea('');
                    setMaxArea('');
                    break;
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-70 flex justify-center items-center z-20">
            <div className="bg-white p-5 rounded-lg shadow-lg w-[360px] h-[auto]">
                <div className="flex items-center justify-between border-b border-gray-300 mb-4">
                    <h2 className="text-2xl font-semibold">
                        {field === 'area' ? 'CHỌN DIỆN TÍCH' : field === 'price' ? 'CHỌN GIÁ' : 'CHỌN KHU VỰC'}
                    </h2>
                    <h2 className="cursor-pointer" onClick={handleCloseModal}>
                        X
                    </h2>
                </div>
                <div className="flex flex-col space-y-4">
                    {/* Handle for area */}
                    {field === 'area' && (
                        <>
                            {options.area.map((option) => (
                                <label key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        value={option}
                                        checked={selected === option}
                                        onChange={() => handleRadioChange(option)}
                                    />
                                    <span className="ml-2">{option}</span>
                                </label>
                            ))}
                            <div className="mt-2 flex space-x-2">
                                <input
                                    type="number"
                                    value={minArea}
                                    onChange={(e) => setMinArea(e.target.value)}
                                    placeholder="Min (m²)"
                                    className="w-full border border-gray-300 rounded p-2"
                                />
                                <input
                                    type="number"
                                    value={maxArea}
                                    onChange={(e) => setMaxArea(e.target.value)}
                                    placeholder="Max (m²)"
                                    className="w-full border border-gray-300 rounded p-2"
                                />
                            </div>
                        </>
                    )}

                    {/* Handle for price */}
                    {field === 'price' && (
                        <>
                            {options.price.map((option) => (
                                <label key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        value={option}
                                        checked={selected === option}
                                        onChange={() => handleRadioChange(option)}
                                    />
                                    <span className="ml-2">{option}</span>
                                </label>
                            ))}
                            <div className="mt-2 flex space-x-2">
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="Min (triệu)"
                                    className="w-full border border-gray-300 rounded p-2"
                                />
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="Max (triệu)"
                                    className="w-full border border-gray-300 rounded p-2"
                                />
                            </div>
                        </>
                    )}

                    {/* Handle for region */}
                    {field === 'region' && (
                        <div>
                            <div>
                                <label>Chọn thành phố:</label>
                                <select
                                    value={selectedCity}
                                    onChange={handleCityChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                >
                                    <option value="">Chọn thành phố</option>
                                    {cities.map((city) => (
                                        <option key={city.code} value={city.code}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-2">
                                <label>Chọn quận/huyện:</label>
                                <select
                                    value={selectedDistrict}
                                    onChange={handleDistrictChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map((district) => (
                                        <option key={district.code} value={district.code}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-2">
                                <label>Chọn phường/xã:</label>
                                <select
                                    value={selectedWard}
                                    onChange={handleWardChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                >
                                    <option value="">Chọn phường/xã</option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {!isValid && <p className="text-red-500 text-center mt-2">Vui lòng nhập đúng dữ liệu!</p>}

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                        onClick={handleCloseModal}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        onClick={handleApplyChanges}
                    >
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
