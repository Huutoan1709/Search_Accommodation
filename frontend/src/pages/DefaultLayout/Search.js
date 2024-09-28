import React, { useState } from 'react';
import SearchItem from '../../components/SearchItem';
import { IoPricetagsOutline } from 'react-icons/io5';
import { MdLocationOn, MdNavigateNext } from 'react-icons/md';
import { RiCrop2Line } from 'react-icons/ri';
import { PiBuildingApartmentBold } from 'react-icons/pi';
import { LiaSearchSolid } from 'react-icons/lia';
import Modal from '../../components/Modal';
import { LuRefreshCcw } from 'react-icons/lu';

function Search({ setSearchParams }) {
    const [isModal, setIsModal] = useState(false);
    const [field, setField] = useState('');
    const [selectedValues, setSelectedValues] = useState({
        city: '',
        district: '',
        ward: '',
        price: 'Chọn giá',
        area: 'Chọn diện tích',
        room_type: 'Chọn loại phòng',
        min_price: undefined,
        max_price: undefined,
        min_area: undefined,
        max_area: undefined,
    });
    const [selectedField, setSelectedField] = useState('');

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
            } else {
                updatedValues.price = selectedRange;
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
            } else {
                updatedValues.area = selectedRange;
            }

            updatedValues.min_area = minArea;
            updatedValues.max_area = maxArea;
        } else if (field === 'region') {
            const { city, district, ward } = selectedRange;

            updatedValues.city = city !== 'Toàn quốc' ? city : '';
            updatedValues.district = district || '';
            updatedValues.ward = ward || '';
        }
        if (field === 'room_type') {
            updatedValues.room_type = selectedRange || 'Chọn loại phòng';
        }

        setSelectedValues(updatedValues);

        const params = {
            min_price: updatedValues.min_price !== undefined ? updatedValues.min_price : '',
            max_price: updatedValues.max_price !== undefined ? updatedValues.max_price : '',
            min_area: updatedValues.min_area !== undefined ? updatedValues.min_area : '',
            max_area: updatedValues.max_area !== undefined ? updatedValues.max_area : '',
            city: updatedValues.city || '',
            district: updatedValues.district || '',
            ward: updatedValues.ward || '',
            room_type: updatedValues.room_type !== 'Chọn loại phòng' ? updatedValues.room_type : '', // Only include if not default
        };

        const queryString = Object.entries(params)
            .filter(([_, value]) => value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        setSearchParams(queryString);
        console.log('Search Parameters:', queryString);
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
            room_type: 'Chọn loại phòng',
        });
        setSearchParams('');
    };
    const truncateText = (text) => {
        return text.length > 20 ? text.slice(0, 20) + '...' : text;
    };
    return (
        <>
            <div className="w-[1024px] h-[60px] p-[10px] bg-white border shadow-xl rounded-lg flex items-center justify-around gap-2">
                <span onClick={() => openModal('room_type')} className="flex-1 cursor-pointer gap-1">
                    <SearchItem
                        iconBf={<PiBuildingApartmentBold size={15} />}
                        iconAf={<MdNavigateNext size={15} />}
                        text={selectedValues.room_type}
                        className={selectedValues.room_type !== 'Chọn loại phòng' ? 'font-semibol ' : ''}
                    />
                </span>
                <span onClick={() => openModal('region')} className="flex-1 cursor-pointer gap-1">
                    <SearchItem
                        iconBf={<MdLocationOn size={15} />}
                        iconAf={<MdNavigateNext size={15} />}
                        text={truncateText(
                            selectedValues.ward
                                ? `${selectedValues.ward}, ${selectedValues.district}.`
                                : selectedValues.district
                                ? `${selectedValues.district}, ${selectedValues.city}`
                                : selectedValues.city
                                ? selectedValues.city
                                : 'Toàn quốc',
                        )}
                        className={
                            selectedValues.city || selectedValues.district || selectedValues.ward ? 'font-semibold' : ''
                        }
                    />
                </span>
                <span onClick={() => openModal('price')} className="flex-1 cursor-pointer gap-1">
                    <SearchItem
                        iconBf={<IoPricetagsOutline size={15} />}
                        iconAf={<MdNavigateNext size={15} />}
                        text={selectedValues.price}
                        className={selectedValues.price !== 'Chọn giá' ? 'font-semibold' : ''}
                    />
                </span>
                <span onClick={() => openModal('area')} className="flex-1 cursor-pointer gap-1">
                    <SearchItem
                        iconBf={<RiCrop2Line size={15} />}
                        iconAf={<MdNavigateNext size={15} />}
                        text={selectedValues.area}
                        className={selectedValues.area !== 'Chọn diện tích' ? 'font-semibol' : ''}
                    />
                </span>
                <span
                    type="button"
                    onClick={handleReset}
                    className="cursor-pointer text-center bg-red-500 py-4 px-2 rounded-md text-[13px] gap-2 text-white font-medium flex items-center justify-center"
                >
                    <LuRefreshCcw />
                    Đặt lại
                </span>
            </div>
            {isModal && <Modal field={selectedField} setIsModal={setIsModal} handleApply={handleApply} />}
        </>
    );
}

export default Search;
