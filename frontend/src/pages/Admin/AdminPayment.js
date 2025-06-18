import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';
import { authApi, endpoints } from '../../API';
import { BiMoney, BiTrendingUp, BiTrendingDown } from 'react-icons/bi';
import { MdPayment } from 'react-icons/md';
import { FaMoneyBillWave } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

const AdminPayment = () => {
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const [paymentData, setPaymentData] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        successRate: 0,
        percentageChange: 0
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentData();
    }, [startDate, endDate]);

    const fetchPaymentData = async () => {
        setLoading(true);
        try {
            // Get payments with date filter
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
            if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);

            // Get data from both endpoints
            const [paymentsResponse, statsResponse] = await Promise.all([
                authApi().get(`${endpoints['listpayment']}?${params}`),
                authApi().get(endpoints['paymentstatistics'])
            ]);

            // Set payment data
            setPaymentData(paymentsResponse.data.payments);

            // Update statistics from overall stats
            const overall = statsResponse.data.overall;
            const monthlyData = statsResponse.data.monthly;

            setStatistics({
                totalRevenue: overall.total_amount,
                totalTransactions: overall.total_count,
                averageTransaction: overall.total_amount / (overall.successful_count || 1),
                successRate: overall.success_rate,
                percentageChange: calculatePercentageChange(monthlyData)
            });

        } catch (error) {
            console.error('Error fetching payment data:', error);
            setError('Không thể tải dữ liệu thanh toán. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to calculate percentage change
    const calculatePercentageChange = (monthlyData) => {
        if (!monthlyData || monthlyData.length < 2) return 0;

        // Sort monthly data by date
        const sortedData = [...monthlyData].sort((a, b) => {
            const dateA = new Date(a.created_at__year, a.created_at__month - 1);
            const dateB = new Date(b.created_at__year, b.created_at__month - 1);
            return dateB - dateA;
        });

        const currentMonth = sortedData[0];
        const previousMonth = sortedData[1];

        if (!previousMonth.total) return 100;

        return ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100;
    };

    // Add this helper function at the top of your component
    const formatDateTime = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch (error) {
            console.warn('Invalid date:', dateString);
            return 'Invalid date';
        }
    };

    // Card Component
    const StatCard = ({ icon: Icon, title, value, percentageChange, color }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm md:text-base lg:text-lg font-medium">{title}</p>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold mt-2">
                        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
                    </h3>
                    {percentageChange !== undefined && (
                        <div className="flex items-center mt-2">
                            {percentageChange >= 0 ? (
                                <BiTrendingUp className="text-green-500 mr-1" />
                            ) : (
                                <BiTrendingDown className="text-red-500 mr-1" />
                            )}
                            <span className={`text-sm md:text-base ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {Math.abs(percentageChange).toFixed(1)}% so với tháng trước
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    // Dữ liệu cho biểu đồ doanh thu theo ngày
    const revenueByDay = paymentData.reduce((acc, payment) => {
        if (payment.status === 'COMPLETED') {
            const dateStr = payment.created_at.split(' ')[0]; // Get just the date part
            acc[dateStr] = (acc[dateStr] || 0) + parseFloat(payment.amount);
        }
        return acc;
    }, {});

    const revenueChartData = {
        labels: Object.keys(revenueByDay).sort((a, b) => {
            const [dayA, monthA, yearA] = a.split('/').map(Number);
            const [dayB, monthB, yearB] = b.split('/').map(Number);
            return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        }),
        datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: Object.values(revenueByDay),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };

    // Dữ liệu cho biểu đồ phân bố loại bài đăng
    const postTypeData = paymentData.reduce((acc, payment) => {
        if (payment.status === 'COMPLETED') {
            const typeName = payment.post_info.type;
            acc[typeName] = (acc[typeName] || 0) + 1;
        }
        return acc;
    }, {});

    const postTypeChartData = {
        labels: Object.keys(postTypeData),
        datasets: [{
            label: 'Số lượng giao dịch',
            data: Object.values(postTypeData),
            backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)'],
            borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)'],
            borderWidth: 1
        }]
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {error ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-800">
                    <h3 className="font-semibold">Lỗi khi tải dữ liệu</h3>
                    <p>{error}</p>
                </div>
            ) : loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Thống kê doanh thu</h1>
                        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-lg shadow w-full md:w-auto">
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-gray-600 whitespace-nowrap">Từ:</span>
                                <DatePicker
                                    selected={startDate}
                                    onChange={setStartDate}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    locale={vi}
                                    dateFormat="dd/MM/yyyy"
                                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-gray-600 whitespace-nowrap">Đến:</span>
                                <DatePicker
                                    selected={endDate}
                                    onChange={setEndDate}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    locale={vi}
                                    dateFormat="dd/MM/yyyy"
                                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            icon={BiMoney}
                            title="Tổng doanh thu"
                            value={`${statistics.totalRevenue.toLocaleString('vi-VN')} VNĐ`}
                            percentageChange={statistics.percentageChange}
                            color="bg-green-500"
                        />
                        <StatCard 
                            icon={MdPayment}
                            title="Tổng giao dịch"
                            value={statistics.totalTransactions}
                            color="bg-blue-500"
                        />
                        <StatCard 
                            icon={FaMoneyBillWave}
                            title="Trung bình/giao dịch"
                            value={`${statistics.averageTransaction.toLocaleString('vi-VN')} VNĐ`}
                            color="bg-amber-500"
                        />
                        <StatCard 
                            icon={BiTrendingUp}
                            title="Tỷ lệ thành công"
                            value={`${statistics.successRate.toFixed(1)}%`}
                            color="bg-purple-500"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Revenue Trend Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-xl font-semibold mb-6">Xu hướng doanh thu</h3>
                            <div className="relative" style={{ height: '300px' }}>
                                <Line 
                                    data={revenueChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: value => `${value.toLocaleString('vi-VN')} VNĐ`
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Post Type Distribution Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-xl font-semibold mb-6">Phân bố loại bài đăng</h3>
                            <div className="relative" style={{ height: '300px' }}>
                                <Bar 
                                    data={postTypeChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-6">Giao dịch gần đây</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Bài đăng</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Mã GD</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paymentData.slice(0, 10).map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                                                {payment.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                                {payment.created_at}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                                                <div>
                                                    <p className="font-medium">{payment.user_info.name}</p>
                                                    <p className="text-gray-500">{payment.user_info.phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-base text-gray-900">
                                                <div className="max-w-xs truncate" title={payment.post_info.title}>
                                                    {payment.post_info.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                                {payment.post_info.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 font-medium">
                                                {parseFloat(payment.amount).toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-base leading-5 font-semibold rounded-full
                                                    ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                                      payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                                      'bg-red-100 text-red-800'}`}
                                                >
                                                    {payment.status_display}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                                {payment.transaction_id}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminPayment;