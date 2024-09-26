import React, { useState } from 'react';
import SearchItem from '../../components/SearchItem';
import { IoPricetagsOutline } from 'react-icons/io5';
import { MdNavigateNext } from 'react-icons/md';
import { RiCrop2Line } from 'react-icons/ri';
import { PiBuildingApartmentBold } from 'react-icons/pi';
import { LiaSearchSolid } from 'react-icons/lia';
import Modal from '../../components/Modal';
import { LuRefreshCcw } from 'react-icons/lu';

function Search({ setSearchParams }) {
    // Destructure setSearchParams from props
    const [isModal, setIsModal] = useState(false);
    const [field, setField] = useState('');
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
    });
    const [selectedField, setSelectedField] = useState('');
    const [searchParamsState, setSearchParamsState] = useState(''); // Renamed to avoid confusion

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
                updatedValues.area = `Từ ${minArea}m2 - ${maxArea}m2`;
            } else if (minArea !== undefined) {
                updatedValues.area = `Từ ${minArea}m2`;
            } else if (maxArea !== undefined) {
                updatedValues.area = `${maxArea}m2 trở xuống`;
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

        // Cập nhật selectedValues với các giá trị mới
        setSelectedValues(updatedValues);

        // Construct searchParams here, ensuring only defined values are included
        const params = {
            min_price: updatedValues.min_price !== undefined ? updatedValues.min_price : '',
            max_price: updatedValues.max_price !== undefined ? updatedValues.max_price : '',
            min_area: updatedValues.min_area !== undefined ? updatedValues.min_area : '',
            max_area: updatedValues.max_area !== undefined ? updatedValues.max_area : '',
            city: updatedValues.city || '',
            district: updatedValues.district || '',
            ward: updatedValues.ward || '',
        };

        // Log the params for debugging

        // Build the query string
        const queryString = Object.entries(params)
            .filter(([_, value]) => value !== '') // Only include entries with non-empty values
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        // Set searchParams in the parent component
        setSearchParams(queryString); // Update the search parameters
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
        });
        setSearchParams(''); // Reset search params as well
    };

    return (
        <>
            <div className="w-[1024px] h-[60px] p-[10px] bg-white border shadow-lg rounded-lg flex items-center justify-around gap-2">
                <span onClick={() => openModal('region')} className="w-50% cursor-pointer">
                    <SearchItem
                        iconBf={<PiBuildingApartmentBold size={15} className="text-gray-400" />}
                        iconAf={<MdNavigateNext size={15} className="text-gray-400" />}
                        text={
                            selectedValues.ward
                                ? `${selectedValues.ward},${selectedValues.district}`
                                : selectedValues.district
                                ? `${selectedValues.district},${selectedValues.city}`
                                : selectedValues.city
                                ? selectedValues.city
                                : 'Toàn quốc'
                        }
                    />
                </span>
                <span onClick={() => openModal('price')} className="flex-1 cursor-pointer">
                    <SearchItem
                        iconBf={<IoPricetagsOutline size={15} className="text-gray-400" />}
                        iconAf={<MdNavigateNext size={15} className="text-gray-400" />}
                        text={selectedValues.price}
                    />
                </span>
                <span onClick={() => openModal('area')} className="flex-1 cursor-pointer">
                    <SearchItem
                        iconBf={<RiCrop2Line size={15} className="text-gray-400" />}
                        iconAf={<MdNavigateNext size={15} className="text-gray-400" />}
                        text={selectedValues.area}
                    />
                </span>
                <span
                    type="button"
                    onClick={handleReset}
                    className=" cursor-pointer text-center bg-slate-300 py-2 px-2 rounded-md text-[13px] gap-2 text-gray-600 font-medium flex items-center justify-center"
                >
                    <LuRefreshCcw />
                    Đặt lại
                </span>
                {/* <span
                    type="button"
                    className="cursor-pointer text-center bg-red-500 py-2 px-2 rounded-md text-[13px] gap-2 text-white font-medium flex items-center justify-center"
                >
                    <LiaSearchSolid />
                    Tìm kiếm
                </span> */}
            </div>
            {isModal && <Modal field={selectedField} setIsModal={setIsModal} handleApply={handleApply} />}
        </>
    );
}

export default Search;
