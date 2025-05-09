import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { notifyError } from '../../../components/ToastManager';
import PaginationUser from '../../../components/PaginationUser';
import { Link } from 'react-router-dom';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 10;

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await authApi().get(endpoints.mypaymenthistory);
                setPayments(response.data);
            } catch (error) {
                notifyError('Có lỗi khi tải lịch sử giao dịch');
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);
    const totalPages = Math.ceil(payments.length / paymentsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            'VNPAY': 'VN Pay',
            'MOMO': 'Momo',
            'CASH': 'Tiền mặt',
        };
        return methods[method] || method;
    };

    return (
        <div className="px-6 py-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <span>Lịch sử giao dịch</span>
                        <span className="text-2xl font-normal text-gray-500">({payments.length} giao dịch)</span>
                    </h1>
                </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
                    </div>
                ) : currentPayments.length > 0 ? (
                    currentPayments.map((payment) => (
                        <div key={payment.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {/* Left side - Transaction Info */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Mã giao dịch:</span>
                                            <span className="font-medium text-gray-900">{payment.transaction_id || 'N/A'}</span>
                                        </div>
                                        
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-gray-500">Tin đăng:</span>
                                            <Link 
                                                to={`/post/${payment.post.id}`}
                                                className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
                                            >
                                                {payment.post.title}
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Loại tin:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                payment.post_type.name === 'VIP' 
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-500' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {payment.post_type.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Phương thức:</span>
                                            <span className="font-medium text-gray-900">
                                                {getPaymentMethodLabel(payment.payment_method)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right side - Amount and Status */}
                                    <div className="space-y-3 text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(payment.amount)}
                                        </div>
                                        
                                        <div>
                                            <span className={`inline-flex px-4 py-2 rounded-full text-base font-medium ${
                                                payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {payment.status_display}
                                            </span>
                                        </div>

                                        <div className="text-base text-gray-500">
                                            {payment.created_at}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                        Không có giao dịch nào...
                    </div>
                )}
            </div>

            {/* Pagination */}
            {currentPayments.length > 0 && (
                <div className="mt-6">
                    <PaginationUser 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;