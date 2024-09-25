import React, { useState } from 'react';
import SearchItem from '../../components/SearchItem';
import { IoPricetagsOutline } from 'react-icons/io5';
import { MdNavigateNext } from 'react-icons/md';
import { RiCrop2Line } from 'react-icons/ri';
import { PiBuildingApartmentBold } from 'react-icons/pi';
import { LiaSearchSolid } from 'react-icons/lia';
import Modal from '../../components/Modal';

function Search() {
    const [isModal, setIsModal] = useState(false);
    const [field, setField] = useState('');
    const [selectedValues, setSelectedValues] = useState({
        city: 'Toàn quốc',
        district: 'Tất cả quận/huyện', // Khởi tạo giá trị ban đầu
        ward: 'Tất cả phường/xã', // Khởi tạo giá trị ban đầu
        price: 'Chọn giá',
        area: 'Chọn diện tích',
    });

    const openModal = (field) => {
        setField(field);
        setIsModal(true);
    };

    const handleApply = (field, value) => {
        if (field === 'region') {
            const { city, district, ward } = value;
            setSelectedValues((prev) => ({
                ...prev,
                city: city || 'Toàn quốc',
                district: district || 'Tất cả quận/huyện',
                ward: ward || 'Tất cả phường/xã',
            }));
        } else {
            setSelectedValues((prev) => ({ ...prev, [field]: value }));
        }
    };
    return (
        <>
            <div className="w-[1024px] h-[55px] p-[10px] bg-white border shadow-lg rounded-lg flex items-center justify-around gap-2">
                <span onClick={() => openModal('region')} className="flex-1 cursor-pointer">
                    <SearchItem
                        iconBf={<PiBuildingApartmentBold size={15} className="text-gray-400" />}
                        iconAf={<MdNavigateNext size={15} className="text-gray-400" />}
                        text={`${selectedValues.city}, ${selectedValues.district}, ${selectedValues.ward}`}
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
                <button
                    type="button"
                    className="text-center flex-1 h-full bg-red-500 py-2 px-2 rounded-md text-[13px] gap-2 text-white font-medium flex items-center"
                >
                    <LiaSearchSolid />
                    Tìm kiếm
                </button>
            </div>
            {isModal && <Modal field={field} setIsModal={setIsModal} handleApply={handleApply} />}
        </>
    );
}

export default Search;
