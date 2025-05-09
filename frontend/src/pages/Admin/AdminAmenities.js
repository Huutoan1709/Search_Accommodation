import React, { useState, useEffect } from 'react';
import { authApi, endpoints } from '../../API';
import { notifySuccess, notifyError } from '../../components/ToastManager';
import { BiSearch, BiEdit, BiTrash } from 'react-icons/bi';
import { IoMdAdd } from 'react-icons/io';

const AdminAmenities = () => {
    const [amenities, setAmenities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quanlity: 1
    });

    const fetchAmenities = async () => {
        try {
            const res = await authApi().get(endpoints['amenities']);
            setAmenities(res.data);
        } catch (err) {
            notifyError('Không thể tải danh sách tiện ích');
        }
    };

    useEffect(() => {
        fetchAmenities();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAmenity) {
                await authApi().patch(`${endpoints['amenities']}${editingAmenity.id}/`, formData);
                notifySuccess('Cập nhật tiện ích thành công');
            } else {
                await authApi().post(endpoints['amenities'], formData);
                notifySuccess('Thêm tiện ích thành công');
            }
            setIsModalOpen(false);
            setEditingAmenity(null);
            setFormData({ name: '', description: '', quanlity: 1 });
            fetchAmenities();
        } catch (err) {
            notifyError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa tiện ích này?')) {
            try {
                await authApi().patch(`${endpoints['amenities']}${id}/`, { is_active: false });
                notifySuccess('Xóa tiện ích thành công');
                fetchAmenities();
            } catch (err) {
                notifyError('Không thể xóa tiện ích');
            }
        }
    };

    const filteredAmenities = amenities.filter(amenity =>
        amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        amenity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý tiện ích</h1>
                <p className="text-gray-600 mt-2">Quản lý danh sách tiện ích cho phòng trọ</p>
            </div>

            {/* Search and Add */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <BiSearch size={20} />
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tiện ích..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingAmenity(null);
                            setFormData({ name: '', description: '', quanlity: 1 });
                            setIsModalOpen(true);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <IoMdAdd size={20} />
                        Thêm tiện ích
                    </button>
                </div>
            </div>

            {/* Amenities List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tên tiện ích</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mô tả</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số lượng</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredAmenities.map((amenity) => (
                            <tr key={amenity.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{amenity.id}</td>
                                <td className="px-6 py-4 font-medium">{amenity.name}</td>
                                <td className="px-6 py-4">{amenity.description}</td>
                                <td className="px-6 py-4">{amenity.quanlity}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                        amenity.is_active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {amenity.is_active ? 'Đang hoạt động' : 'Đã vô hiệu'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => {
                                                setEditingAmenity(amenity);
                                                setFormData({
                                                    name: amenity.name,
                                                    description: amenity.description || '',
                                                    quanlity: amenity.quanlity
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <BiEdit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(amenity.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <BiTrash size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingAmenity ? 'Chỉnh sửa tiện ích' : 'Thêm tiện ích mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên tiện ích
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số lượng
                                </label>
                                <input
                                    type="number"
                                    value={formData.quanlity}
                                    onChange={(e) => setFormData({...formData, quanlity: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingAmenity ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAmenities;