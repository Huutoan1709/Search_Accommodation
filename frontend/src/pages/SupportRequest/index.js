import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../DefaultLayout/Header';
import Footer from '../DefaultLayout/footer';
import { notifySuccess, notifyWarning, notifyError } from '../../components/ToastManager';
import API, { endpoints, authApi } from '../../API';
import { useContext } from 'react';
import MyContext from '../../context/MyContext';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaComments } from 'react-icons/fa';

const SupportRequest = () => {
    const { user, login, fetchUser } = useContext(MyContext);
    useEffect(() => {
        if (user) {
            fetchUser();
        }
    }, [fetchUser]);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
    });
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await authApi().post(endpoints.supportrequest, {
                subject: formData.subject,
                description: formData.description,
            });

            if (response.status === 201) {
                notifySuccess('Yêu cầu hỗ trợ của bạn đã được gửi thành công.');
                navigate('/');
            } else {
                notifyWarning('Có lỗi xảy ra khi gửi yêu cầu hỗ trợ.');
            }
        } catch (error) {
            notifyError('Có lỗi xảy ra: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Liên Hệ & Hỗ Trợ
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Thông Tin Liên Hệ</h2>
                        
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <FaPhone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium">Điện thoại</p>
                                    <p className="text-lg">096 1499 124</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <FaEnvelope className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-lg">nguyenhuutoan010@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <FaComments className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium">Zalo</p>
                                    <p className="text-lg">096 1499 124</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <FaMapMarkerAlt className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium">Địa chỉ</p>
                                    <p className="text-lg">18 đường số 5, phường 17, quận Gò Vấp, TP.Hồ Chí Minh</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-white/10 rounded-xl">
                            <p className="text-sm italic">
                                "Chúng tôi biết bạn có rất nhiều sự lựa chọn. Cảm ơn vì đã lựa chọn chúng tôi"
                            </p>
                        </div>
                    </div>

                    {/* Support Request Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi Yêu Cầu Hỗ Trợ</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="subject">
                                    Chủ đề
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="Nhập chủ đề của bạn"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                                    Nội dung
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[200px]"
                                    placeholder="Mô tả chi tiết yêu cầu của bạn..."
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Gửi yêu cầu
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SupportRequest;
