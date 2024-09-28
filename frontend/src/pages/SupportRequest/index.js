import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../DefaultLayout/Header';
import Footer from '../DefaultLayout/footer';
import { notifySuccess, notifyWarning, notifyError } from '../../components/ToastManager';
import API, { endpoints, authApi } from '../../API';
import { useContext } from 'react';
import MyContext from '../../context/MyContext';

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
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 w-[1024px] mx-auto ">
                <div className="flex flex-col md:flex-row md:space-x-8 mt-10">
                    <div className="md:w-1/2 bg-gradient-to-b from-blue-500 to-cyan-500 text-white p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Thông tin liên hệ</h2>
                        <p className="mb-4">
                            Chúng tôi biết bạn có rất nhiều sự lựa chọn. Nhưng cảm ơn vì đã lựa chọn chúng tôi
                        </p>
                        <p>
                            <strong>Điện thoại:</strong> 096 1499 124
                        </p>
                        <p>
                            <strong>Email:</strong> nguyenhuutoan010@gmail.com
                        </p>
                        <p>
                            <strong>Zalo:</strong> 096 1499 124
                        </p>
                        <p className="mt-4">
                            <strong>Địa chỉ:</strong>
                        </p>
                        <p>18 đường số 5, phường 17, quận Gò Vấp, TP.Hồ Chí Minh</p>
                    </div>

                    {/* Support Request Form Section */}
                    <div className="md:w-1/2 mt-6 md:mt-0">
                        <h2 className="text-2xl font-semibold mb-4">Liên hệ trực tuyến</h2>
                        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-lg">
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="subject">
                                    Chủ đề
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập chủ đề"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="description">
                                    Nội dung
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="6"
                                    placeholder="Nhập nội dung yêu cầu"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Gửi liên hệ
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
