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
    const [selectedCityName, setSelectedCityName] = useState('');
    const [selectedDistrictName, setSelectedDistrictName] = useState('');
    const [selectedWardName, setSelectedWardName] = useState('');
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
        const selectedCityCode = e.target.value;
        const selectedCityName = e.target.options[e.target.selectedIndex]?.text; // Get the name of the selected city
        setSelectedCity(selectedCityCode);
        setSelectedCityName(selectedCityName); // Store the city name

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedCityCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
            setWards([]);
            setSelectedDistrict(''); // Reset selected district
            setSelectedWard(''); // Reset selected ward
            setSelectedDistrictName(''); // Reset district name
            setSelectedWardName(''); // Reset ward name
        } catch (error) {
            console.error('Failed to fetch districts:', error);
        }
    };

    const handleDistrictChange = async (e) => {
        const selectedDistrictCode = e.target.value;
        const selectedDistrictName = e.target.options[e.target.selectedIndex]?.text; // Get the name of the selected district
        setSelectedDistrict(selectedDistrictCode);
        setSelectedDistrictName(selectedDistrictName); // Store the district name

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`);
            const data = await response.json();
            setWards(data.wards);
            setSelectedWard(''); // Reset selected ward
            setSelectedWardName(''); // Reset ward name
        } catch (error) {
            console.error('Failed to fetch wards:', error);
        }
    };

    const handleWardChange = (e) => {
        const selectedWardCode = e.target.value;
        const selectedWardName = e.target.options[e.target.selectedIndex]?.text; // Get the name of the selected ward
        setSelectedWard(selectedWardCode);
        setSelectedWardName(selectedWardName); // Store the ward name
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (field === 'price') {
            if (!minPrice && !maxPrice) {
                setIsValid(false);
                return;
            }
            handleApply(field, selected, minPrice, maxPrice);
        } else if (field === 'area') {
            if (!minArea && !maxArea) {
                setIsValid(false);
                return;
            }
            handleApply(field, selected, minArea, maxArea);
        } else if (field === 'region') {
            const selectedRange = {
                city: selectedCityName,
                district: selectedDistrictName,
                ward: selectedWardName,
            };
            handleApply(field, selectedRange);
        }
        setIsModal(false);
    };

    return (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <form onSubmit={handleSubmit} className="modal-content bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 border-dashed">
                    {field === 'region' ? 'CHỌN KHU VỰC' : field === 'price' ? 'CHỌN MỨC GIÁ' : 'CHỌN DIỆN TÍCH'}
                </h2>
                {field === 'region' && (
                    <>
                        <select onChange={handleCityChange} className="border p-2 mb-2 rounded">
                            <option value="">Chọn tỉnh</option>
                            {cities.map((city) => (
                                <option key={city.code} value={city.code}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        <select onChange={handleDistrictChange} className="border p-2 mb-2 rounded">
                            <option value="">Chọn quận</option>
                            {districts.map((district) => (
                                <option key={district.code} value={district.code}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                        <select onChange={handleWardChange} className="border p-2 mb-2 rounded">
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
                            placeholder="Giá tối thiểu"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="border p-2 mb-2 rounded w-full"
                        />
                        <input
                            type="number"
                            placeholder="Giá tối đa"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="border p-2 mb-2 rounded w-full"
                        />
                    </>
                )}
                {field === 'area' && (
                    <>
                        <input
                            type="number"
                            placeholder="Diện tích tối thiểu"
                            value={minArea}
                            onChange={(e) => setMinArea(e.target.value)}
                            className="border p-2 mb-2 rounded w-full"
                        />
                        <input
                            type="number"
                            placeholder="Diện tích tối đa"
                            value={maxArea}
                            onChange={(e) => setMaxArea(e.target.value)}
                            className="border p-2 mb-2 rounded w-full"
                        />
                    </>
                )}
                <div className="flex items-center justify-between mt-3">
                    {!isValid && <p className="text-red-500 mt-2">Vui lòng điền ít nhất một trường.</p>}
                    <button
                        type="button"
                        onClick={() => setIsModal(false)}
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                    >
                        Đóng
                    </button>
                    <button type="submit" className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
                        Áp dụng
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Modal;
