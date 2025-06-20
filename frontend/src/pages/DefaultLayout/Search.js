import React, { useState, useEffect } from 'react';
import SearchItem from '../../components/SearchItem';
import { IoPricetagsOutline } from 'react-icons/io5';
import { MdLocationOn, MdNavigateNext } from 'react-icons/md';
import { RiCrop2Line } from 'react-icons/ri';
import { PiBuildingApartmentBold } from 'react-icons/pi';
import Modal from '../../components/Modal';
import { LuRefreshCcw } from 'react-icons/lu';
import { BiSearch } from 'react-icons/bi';
import LocationSearch from './LocationSearch';
import MapViewModal from '../../components/MapViewModal';
import { FaMapMarked } from "react-icons/fa";
import VoiceSearch from '../../components/VoiceSearch';
import { authApi, endpoints } from '../../API';

function Search({ setSearchParams, room_type }) {
    const [isModal, setIsModal] = useState(false);
    const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState({
        city: '',
        district: '',
        ward: '',
        price: 'Chọn giá',
        area: 'Chọn diện tích',
        min_price: undefined,
        max_price: undefined,
        min_area: undefined,
        max_area: undefined,
        room_type: room_type || 'Loại phòng',
    });
    const [selectedField, setSelectedField] = useState('');
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    useEffect(() => {
        setSelectedValues((prev) => ({
            ...prev,
            room_type: room_type,
        }));
    }, [room_type]);

    const openModal = (field) => {
        setSelectedField(field);
        setIsModal(true);
    };

    const handleApply = (field, selectedRange, minValue, maxValue) => {
        let updatedValues = { ...selectedValues };

        if (field === 'price') {
            const minPrice = minValue ? parseFloat(minValue) : undefined;
            const maxPrice = maxValue ? parseFloat(maxValue) : undefined;

            if (minPrice !== undefined && maxPrice !== undefined) {
                updatedValues.price = `Từ ${minPrice} triệu - ${maxPrice} triệu`;
            } else if (minPrice !== undefined) {
                updatedValues.price = `Từ ${minPrice} triệu`;
            } else if (maxPrice !== undefined) {
                updatedValues.price = `${maxPrice} triệu trở xuống`;
            }

            updatedValues.min_price = minPrice;
            updatedValues.max_price = maxPrice;
        } else if (field === 'area') {
            const minArea = minValue ? parseFloat(minValue) : undefined;
            const maxArea = maxValue ? parseFloat(maxValue) : undefined;

            if (minArea !== undefined && maxArea !== undefined) {
                updatedValues.area = `Từ ${minArea}m² - ${maxArea}m²`;
            } else if (minArea !== undefined) {
                updatedValues.area = `Từ ${minArea}m²`;
            } else if (maxArea !== undefined) {
                updatedValues.area = `${maxArea}m² trở xuống`;
            }

            updatedValues.min_area = minArea;
            updatedValues.max_area = maxArea;
        } else if (field === 'region') {
            const { city, district, ward } = selectedRange;

            updatedValues.city = city !== 'Toàn quốc' ? city : '';
            updatedValues.district = district || '';
            updatedValues.ward = ward || '';
        }

        updatedValues.room_type = selectedValues.room_type || room_type;

        setSelectedValues(updatedValues);

        const params = {
            min_price: updatedValues.min_price !== undefined ? updatedValues.min_price : '',
            max_price: updatedValues.max_price !== undefined ? updatedValues.max_price : '',
            min_area: updatedValues.min_area !== undefined ? updatedValues.min_area : '',
            max_area: updatedValues.max_area !== undefined ? updatedValues.max_area : '',
            city: updatedValues.city || '',
            district: updatedValues.district || '',
            ward: updatedValues.ward || '',
            room_type: updatedValues.room_type || '',
        };
        const queryString = Object.entries(params)
            .filter(([_, value]) => value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        setSearchParams(queryString);
        console.log('Search Parameters:', queryString);

        // Lưu lịch sử tìm kiếm
        saveSearchHistory(params);
    };

    const handleReset = () => {
        setSelectedValues({
            city: '',
            district: '',
            ward: '',
            price: 'Chọn giá',
            area: 'Chọn diện tích',
            min_price: undefined,
            max_price: undefined,
            min_area: undefined,
            max_area: undefined,
            room_type: room_type,
        });
        setSearchParams({ room_type: room_type });
    };
    const buildSearchParams = (values) => {
        const params = {
            min_price: values.min_price || '',
            max_price: values.max_price || '',
            min_area: values.min_area || '',
            max_area: values.max_area || '',
            city: values.city.name || '',
            district: values.district.name || '',
            ward: values.ward || '',
            room_type: values.room_type || '',
            min_latitude: values.min_latitude || '',
            max_latitude: values.max_latitude || '',
            min_longitude: values.min_longitude || '',
            max_longitude: values.max_longitude || '',
        };

        return Object.entries(params)
            .filter(([_, value]) => value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
    };

    const handleSearchAroundClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsLocationSearchOpen(true);
    };

    const handleLocationSearchClose = () => {
        setIsLocationSearchOpen(false);
    };

    const handleLocationSearchSubmit = (params) => {
        const { latitude, longitude } = params;

        const minLatitude = latitude - 0.04;
        const maxLatitude = latitude + 0.04;
        const minLongitude = longitude - 0.04;
        const maxLongitude = longitude + 0.04;

        const updatedParams = {
            ...params,
            min_latitude: minLatitude,
            max_latitude: maxLatitude,
            min_longitude: minLongitude,
            max_longitude: maxLongitude,
        };

        setSearchParams(buildSearchParams(updatedParams));
        console.log('Tìm kiếm xung quanh:', updatedParams);
    };

    const truncateText = (text) => {
        return text.length > 20 ? text.slice(0, 20) + '...' : text;
    };

    const handleVoiceResult = (result) => {
        let updatedValues = { ...selectedValues };

        if (result.room_type) {
            updatedValues.room_type = result.room_type;
        }

        if (result.location) {
            updatedValues.city = result.location.city || '';
            updatedValues.district = result.location.district || '';
            updatedValues.ward = result.location.ward || '';
        }

        if (result.price) {
            if (result.price.min !== null && result.price.max !== null) {
                updatedValues.price = `Từ ${result.price.min} triệu - ${result.price.max} triệu`;
                updatedValues.min_price = result.price.min;
                updatedValues.max_price = result.price.max;
            } else if (result.price.min !== null) {
                updatedValues.price = `Từ ${result.price.min} triệu`;
                updatedValues.min_price = result.price.min;
                updatedValues.max_price = undefined;
            } else if (result.price.max !== null) {
                updatedValues.price = `${result.price.max} triệu trở xuống`;
                updatedValues.min_price = undefined;
                updatedValues.max_price = result.price.max;
            }
        }

        if (result.area) {
            if (result.area.min !== null && result.area.max !== null) {
                updatedValues.area = `Từ ${result.area.min}m² - ${result.area.max}m²`;
                updatedValues.min_area = result.area.min;
                updatedValues.max_area = result.area.max;
            } else if (result.area.min !== null) {
                updatedValues.area = `Từ ${result.area.min}m²`;
                updatedValues.min_area = result.area.min;
                updatedValues.max_area = undefined;
            } else if (result.area.max !== null) {
                updatedValues.area = `${result.area.max}m² trở xuống`;
                updatedValues.min_area = undefined;
                updatedValues.max_area = result.area.max;
            }
        }

        setSelectedValues(updatedValues);

        const params = {
            min_price: updatedValues.min_price || '',
            max_price: updatedValues.max_price || '',
            min_area: updatedValues.min_area || '',
            max_area: updatedValues.max_area || '',
            city: updatedValues.city || '',
            district: updatedValues.district || '',
            ward: updatedValues.ward || '',
            room_type: updatedValues.room_type || room_type || '',
        };

        const queryString = Object.entries(params)
            .filter(([_, value]) => value !== '')
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        setSearchParams(queryString);
    };

    const saveSearchHistory = async (searchParams) => {
        const accessToken = localStorage.getItem('access-token');
        if (!accessToken) return;
        
        try {
            // Make sure this endpoint matches your Django URL configuration
            await authApi().post(endpoints['searchhistory'], {
                room_tyrchpe: searchParams.room_type || '',
                min_price: searchParams.min_price || null,
                max_price: searchParams.max_price || null,
                min_area: searchParams.min_area || null,
                max_area: searchParams.max_area || null,
                city: searchParams.city || '',
                district: searchParams.district || '',
                ward: searchParams.ward || ''
            });
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Search history save failed:', error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error setting up request:', error.message);
            }
        }
    };

    return (
        <>
            {/* Mobile Search Bar - Removed fixed positioning */}
            <div className="md:hidden w-full bg-white">
                <div className="flex flex-col gap-2 p-3">
                    {/* Room Type */}
                    <div onClick={() => openModal('room_type')} className="w-full">
                        <SearchItem
                            iconBf={<PiBuildingApartmentBold size={15} />}
                            iconAf={<MdNavigateNext size={15} />}
                            text={selectedValues.room_type || 'Loại phòng'}
                            className={selectedValues.room_type !== 'Loại phòng' ? 'font-semibold' : ''}
                        />
                    </div>

                    {/* Location */}
                    <div onClick={() => openModal('region')} className="w-full">
                        <SearchItem
                            iconBf={<MdLocationOn size={15} />}
                            iconAf={<MdNavigateNext size={15} />}
                            text={
                                selectedValues.ward
                                    ? truncateText(`${selectedValues.ward}, ${selectedValues.district}`)
                                    : selectedValues.district
                                    ? truncateText(`${selectedValues.district}, ${selectedValues.city}`)
                                    : selectedValues.city
                                    ? truncateText(selectedValues.city)
                                    : 'Toàn quốc'
                            }
                            className={
                                selectedValues.city || selectedValues.district || selectedValues.ward ? 'font-semibold' : ''
                            }
                        />
                    </div>

                    {/* Price Range */}
                    <div onClick={() => openModal('price')} className="w-full">
                        <SearchItem
                            iconBf={<IoPricetagsOutline size={15} />}
                            iconAf={<MdNavigateNext size={15} />}
                            text={selectedValues.price}
                            className={selectedValues.price !== 'Chọn giá' ? 'font-semibold' : ''}
                        />
                    </div>

                    {/* Area Range */}
                    <div onClick={() => openModal('area')} className="w-full">
                        <SearchItem
                            iconBf={<RiCrop2Line size={15} />}
                            iconAf={<MdNavigateNext size={15} />}
                            text={selectedValues.area}
                            className={selectedValues.area !== 'Chọn diện tích' ? 'font-semibold' : ''}
                        />
                    </div>

                    {/* Action Buttons - Improved mobile layout */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleSearchAroundClick}
                            className="bg-gray-800 py-2.5 px-3 rounded-md text-white text-sm font-medium 
                                     flex items-center justify-center gap-1.5"
                        >
                            <BiSearch size={15} />
                            <span>Xung quanh</span>
                        </button>
                        <button
                            onClick={() => setIsMapModalOpen(true)}
                            className="bg-gray-800 py-2.5 px-3 rounded-md text-white text-sm font-medium 
                                     flex items-center justify-center gap-1.5"
                        >
                            <FaMapMarked size={15} />
                            <span>Xem bản đồ</span>
                        </button>
                        <div className="flex gap-2">
                            <VoiceSearch onVoiceResult={handleVoiceResult} />
                            <button
                                onClick={handleReset}
                                className="flex-1 bg-red-600 hover:bg-red-700 py-2.5 px-3 rounded-md 
                                         text-white text-sm font-medium flex items-center justify-center"
                            >
                                <LuRefreshCcw size={15} />
                                <span className="ml-1.5">Đặt lại</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:block w-full max-w-[1024px] h-[70px] p-[8px] bg-white border shadow-xl rounded-lg">
                <div className="flex items-center justify-around gap-2 h-full">
                    <span className="flex-1 cursor-pointer">
                        <SearchItem
                            iconBf={<PiBuildingApartmentBold size={15} />}
                            iconAf={<MdNavigateNext size={15} />}
                            text={selectedValues.room_type || 'Loại phòng'}
                            className={selectedValues.room_type !== 'Loại phòng' ? 'font-semibold' : ''}
                        />
                    </span>
                    <span onClick={() => openModal('region')} className="flex-1 cursor-pointer gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
                        <SearchItem
                            iconBf={<MdLocationOn size={15} />}
                            iconAf={<MdNavigateNext size={15} />}
                            text={
                                selectedValues.ward
                                    ? `${selectedValues.ward}, ${selectedValues.district}.`
                                    : selectedValues.district
                                    ? `${selectedValues.district}, ${selectedValues.city}`
                                    : selectedValues.city
                                    ? selectedValues.city
                                    : 'Toàn quốc'
                            }
                            className={
                                selectedValues.city || selectedValues.district || selectedValues.ward ? 'font-semibold' : ''
                            }
                        />
                    </span>
                    <span onClick={() => openModal('price')} className="flex-1 cursor-pointer gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
                        <SearchItem
                            iconBf={<IoPricetagsOutline size={15} />}
                            iconAf={<MdNavigateNext size={15} />}
                            text={selectedValues.price}
                            className={selectedValues.price !== 'Chọn giá' ? 'font-semibold' : ''}
                        />
                    </span>
                    <span onClick={() => openModal('area')} className="flex-1 cursor-pointer gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
                        <SearchItem
                            iconBf={<RiCrop2Line size={15} />}
                            iconAf={<MdNavigateNext size={15} />}
                            text={selectedValues.area}
                            className={selectedValues.area !== 'Chọn diện tích' ? 'font-semibold' : ''}
                        />
                    </span>
                    

                    <span
                        type="button"
                        onClick={handleSearchAroundClick}
                        className="cursor-pointer text-center bg-gray-800 py-4 px-2 rounded-md text-[13px] gap-2 text-white font-medium flex items-center justify-center"
                    >
                        <BiSearch />
                        Xung quanh
                    </span>
                    <span
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="cursor-pointer text-center bg-gray-800 py-4 px-2 rounded-md text[13px] gap-2 text-white font-medium flex items-center justify-center"
                    >
                        <FaMapMarked/>
                        Xem trên map
                    </span>
                    <VoiceSearch onVoiceResult={handleVoiceResult} />
                    <span
                        type="button"
                        onClick={handleReset}
                        className="cursor-pointer text-center bg-red-600 hover:bg-red-700 py-4 px-2 rounded-md text-[13px] gap-2 text-white font-medium flex items-center justify-center"
                    >
                        <LuRefreshCcw />
                        Reset
                    </span>
                    
                </div>
            </div>
            

            {isModal && <Modal field={selectedField} setIsModal={setIsModal} handleApply={handleApply} />}
            {isLocationSearchOpen && (
                <LocationSearch onSubmit={handleLocationSearchSubmit} onClose={handleLocationSearchClose} />
            )}
            <MapViewModal 
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
            />
        </>
    );
}

export default Search;
