import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi, endpoints } from '../../../API';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const navigate = useNavigate();

    useEffect(() => {
        const processPayment = async () => {
            try {
                const response = await authApi().get(`${endpoints.paymentreturn}?${searchParams.toString()}`);
                setStatus(response.data.message === 'success' ? 'success' : 'failed');
            } catch (error) {
                console.error('Payment processing error:', error);
                setStatus('failed');
            }
        };

        processPayment();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
            >
                {status === 'success' ? (
                    <>
                        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Thanh toán thành công!
                        </h2>
                        <p className="text-gray-600 text-center mb-6">
                            Bài đăng của bạn đã được thanh toán và sẽ được hiển thị sau khi được duyệt.
                        </p>
                    </>
                ) : status === 'failed' ? (
                    <>
                        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Thanh toán thất bại
                        </h2>
                        <p className="text-gray-600 text-center mb-6">
                            Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.
                        </p>
                    </>
                ) : (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/profile/managepost')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Quản lý tin đăng
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Về trang chủ
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentResult;