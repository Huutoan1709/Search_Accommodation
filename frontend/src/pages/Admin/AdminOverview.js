import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2'; 
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { FaUserAlt, FaClipboardList, FaUsers, FaWarehouse, FaEye } from 'react-icons/fa';
import { BiTrendingUp, BiTrendingDown } from 'react-icons/bi';
import API, { authApi, endpoints } from '../../API';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

const AdminOverview = () => {
    // Existing states
    const [userCount, setUserCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [landlordCount, setLandlordCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [postStatistics, setPostStatistics] = useState({ locked: 0, active: 0, hidden: 0 });
    const [topLandlords, setTopLandlords] = useState([]);
    const [cityPostCounts, setCityPostCounts] = useState({});
    
    // New states
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('year');
    const [loading, setLoading] = useState(true);
    const [percentageChanges, setPercentageChanges] = useState({
        users: 0,
        posts: 0,
        customers: 0,
        landlords: 0
    });

    // Date handling
    const currentDate = new Date();
    const [startDate, setStartDate] = useState(new Date(currentDate.getFullYear(), 0, 1));
    const [endDate, setEndDate] = useState(currentDate);

    // Existing useEffect
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchCounts(),
                    fetchPostStatistics(),
                    fetchTopLandlords(),
                    fetchMonthlyStats()
                ]);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [startDate, endDate, selectedPeriod]);
    const fetchCounts = async () => {
        try {
            let allUsers = [];
            let nextUrl = endpoints.listuser;

            // Fetch all pages
            while (nextUrl) {
                const userResponse = await authApi().get(nextUrl);
                const userData = userResponse.data;
                allUsers = [...allUsers, ...userData.results];
                nextUrl = userData.next ? new URL(userData.next).pathname + new URL(userData.next).search : null;
            }

            // Filter active users (exclude blocked and inactive)
            const activeUsers = allUsers.filter(user => 
                user.is_active && !user.is_block && user.role !== 'WEBMASTER' && !user.is_superuser
            );
            
            // Count by role
            const totalCustomers = activeUsers.filter(user => user.role === 'CUSTOMER').length;
            const totalLandlords = activeUsers.filter(user => user.role === 'LANDLORD').length;
            
            // Set total counts
            setUserCount(activeUsers.length);
            setCustomerCount(totalCustomers);
            setLandlordCount(totalLandlords);

            // Get current month and year
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            // Filter users by month
            const thisMonthUsers = activeUsers.filter(user => {
                const createdDate = new Date(user.date_joined);
                return createdDate.getMonth() === currentMonth && 
                       createdDate.getFullYear() === currentYear;
            });

            const lastMonthUsers = activeUsers.filter(user => {
                const createdDate = new Date(user.date_joined);
                return createdDate.getMonth() === (currentMonth - 1) && 
                       createdDate.getFullYear() === currentYear;
            });

            // Calculate current month counts by role
            const currentMonthCustomers = thisMonthUsers.filter(user => user.role === 'CUSTOMER').length;
            const currentMonthLandlords = thisMonthUsers.filter(user => user.role === 'LANDLORD').length;

            // Calculate last month counts by role  
            const lastMonthCustomers = lastMonthUsers.filter(user => user.role === 'CUSTOMER').length;
            const lastMonthLandlords = lastMonthUsers.filter(user => user.role === 'LANDLORD').length;

            // Calculate growth rates
            const calculateGrowth = (current, previous) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return ((current - previous) / previous) * 100;
            };

            // Update percentage changes
            setPercentageChanges({
                users: calculateGrowth(thisMonthUsers.length, lastMonthUsers.length),
                customers: calculateGrowth(currentMonthCustomers, lastMonthCustomers),
                landlords: calculateGrowth(currentMonthLandlords, lastMonthLandlords),
            });

            // Debug logs
            console.log('Total Users:', allUsers.length);
            console.log('Active Users:', activeUsers.length);
            console.log('Customers:', totalCustomers);
            console.log('Landlords:', totalLandlords);
            console.log('Growth Rates:', {
                users: percentageChanges.users,
                customers: percentageChanges.customers,
                landlords: percentageChanges.landlords
            });

        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    const fetchPostStatistics = async () => {
        try {
            let allPosts = [];
            let nextUrl = `${endpoints.post}?all=true`;

            // Fetch all pages of posts
            while (nextUrl) {
                const response = await authApi().get(nextUrl);
                const postData = response.data;
                allPosts = [...allPosts, ...postData.results];
                nextUrl = postData.next ? new URL(postData.next).pathname + new URL(postData.next).search : null;
            }

            // Set total post count
            setPostCount(allPosts.length);

            // Get current month and year
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Filter posts by month
            const thisMonthPosts = allPosts.filter(post => {
                const createdDate = new Date(post.created_at);
                return createdDate.getMonth() === currentMonth && 
                       createdDate.getFullYear() === currentYear;
            });

            const lastMonthPosts = allPosts.filter(post => {
                const createdDate = new Date(post.created_at);
                return createdDate.getMonth() === (currentMonth - 1) && 
                       createdDate.getFullYear() === currentYear;
            });

            // Calculate growth rate for posts
            const calculateGrowth = (current, previous) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return ((current - previous) / previous) * 100;
            };

            const postGrowth = calculateGrowth(thisMonthPosts.length, lastMonthPosts.length);

            // Update percentage changes including posts
            setPercentageChanges(prev => ({
                ...prev,
                posts: postGrowth
            }));

            // Count post statistics
            let locked = 0;
            let active = 0;
            let hidden = 0;
            const cityCounts = {};

            allPosts.forEach((post) => {
                const city = post.room?.city || 'Khác';
                if (!cityCounts[city]) {
                    cityCounts[city] = 0;
                }
                cityCounts[city]++;

                if (post.is_block) {
                    locked++;
                } else if (post.is_active) {
                    if (post.is_approved) {
                        active++;
                    } else {
                        hidden++;
                    }
                } else {
                    hidden++;
                }
            });

            setPostStatistics({ locked, active, hidden });
            setCityPostCounts(cityCounts);

            // Debug logs
            console.log('Post Statistics:', {
                total: allPosts.length,
                thisMonth: thisMonthPosts.length,
                lastMonth: lastMonthPosts.length,
                growth: postGrowth
            });

        } catch (error) {
            console.error('Error fetching post statistics:', error);
        }
    };

    const fetchTopLandlords = async () => {
        try {
            const response = await API.get(endpoints.listuser);
            const landlords = response.data.results
                .filter((user) => user.role === 'LANDLORD' && user.average_rating)
                .sort((a, b) => b.average_rating - a.average_rating)
                .slice(0, 5);

            setTopLandlords(landlords);
        } catch (error) {
            console.error('Error fetching top landlords:', error);
        }
    };
    // New function to fetch monthly statistics
    const fetchMonthlyStats = async () => {
        try {
            let allPosts = [];
            let nextUrl = `${endpoints.post}?all=true`;

            // Fetch all pages
            while (nextUrl) {
                const response = await authApi().get(nextUrl);
                const postData = response.data;
                allPosts = [...allPosts, ...postData.results];
                nextUrl = postData.next ? new URL(postData.next).pathname + new URL(postData.next).search : null;
            }

            // Initialize monthly data array
            const monthlyData = new Array(12).fill(0);

            // Count posts for each month
            allPosts.forEach(post => {
                const date = new Date(post.created_at);
                if (date.getFullYear() === currentDate.getFullYear()) {
                    monthlyData[date.getMonth()]++;
                }
            });

            setMonthlyStats(monthlyData);

            // Debug log
            console.log('Monthly Stats:', {
                data: monthlyData,
                total: allPosts.length
            });

        } catch (error) {
            console.error('Error fetching monthly stats:', error);
        }
    };
    const renderStars = (rating) => {
        return (
            <div className="flex text-amber-400">
                {[...Array(5)].map((_, index) => (
                    <svg
                        key={index}
                        className={`w-4 h-4 ${index < rating ? 'text-amber-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };
    
    // Add donut chart data configuration
    const donutData = {
        labels: ['Đang hoạt động', 'Đã ẩn', 'Đã khóa'],
        datasets: [
            {
                data: [
                    postStatistics.active,
                    postStatistics.hidden,
                    postStatistics.locked
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',  // green
                    'rgba(234, 179, 8, 0.8)',   // amber
                    'rgba(239, 68, 68, 0.8)',   // red
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(234, 179, 8)',
                    'rgb(239, 68, 68)',
                ],
                borderWidth: 1,
            },
        ],
    };
    
    // Add bar chart data configuration
    const barData = {
        labels: Object.keys(cityPostCounts),
        datasets: [
            {
                label: 'Số lượng tin đăng',
                data: Object.values(cityPostCounts),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    };
    // Monthly Posts Line Chart Data
    const monthlyStatsData = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
            {
                label: 'Số lượng tin đăng theo tháng',
                data: monthlyStats,
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4
            }
        ]
    };

    // First, add this chart options configuration after your monthlyStatsData definition
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    stepSize: 1
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 10,
                    padding: 20
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        elements: {
            line: {
                tension: 0.4
            },
            point: {
                radius: 4,
                hitRadius: 10,
                hoverRadius: 6
            }
        }
    };

    // Card Component
    const StatCard = ({ icon: Icon, title, value, percentageChange, color }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-2xl font-medium">{title}</p>
                    <h3 className="text-2xl font-bold mt-2">{value}</h3>
                    {percentageChange !== undefined && (
                        <div className="flex items-center mt-2">
                            {percentageChange >= 0 ? (
                                <BiTrendingUp className="text-green-500 mr-1" />
                            ) : (
                                <BiTrendingDown className="text-red-500 mr-1" />
                            )}
                            <span className={` text-xl ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {Math.abs(percentageChange)}% so với tháng trước
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

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Tổng quan thống kê</h1>
                        <div className="flex gap-4">
                            <select 
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="year">Năm nay</option>
                                <option value="month">Tháng này</option>
                                <option value="week">Tuần này</option>
                            </select>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            icon={FaUserAlt}
                            title="Tổng người dùng"
                            value={userCount}
                            percentageChange={percentageChanges.users}
                            color="bg-blue-500"
                            
                        />
                        <StatCard 
                            icon={FaClipboardList}
                            title="Tổng tin đăng"
                            value={postCount}
                            percentageChange={percentageChanges.posts}
                            color="bg-purple-500"
                        />
                        <StatCard 
                            icon={FaUsers}
                            title="Khách hàng"
                            value={customerCount}
                            percentageChange={percentageChanges.customers}
                            color="bg-green-500"
                        />
                        <StatCard 
                            icon={FaWarehouse}
                            title="Chủ trọ"
                            value={landlordCount}
                            percentageChange={percentageChanges.landlords}
                            color="bg-amber-500"
                        />
                    </div>

                   
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-semibold mb-6">Xu hướng tin đăng</h3>
                            <div className="relative" style={{ height: '300px' }}>
                                <Line 
                                    data={monthlyStatsData} 
                                    options={lineChartOptions}
                                />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-semibold mb-6">Phân bố trạng thái tin đăng</h3>
                            <div className="relative h-[300px]">
                                <Doughnut data={donutData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                    

                    {/* City Distribution Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                        <h3 className="text-2xl font-semibold mb-6">Phân bố tin đăng theo thành phố</h3>
                        <div className="h-[400px]">
                            <Bar data={barData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    {/* Top Landlords Table */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-semibold">Top Chủ trọ Đánh giá Cao</h3>
                            <button className="text-amber-500 hover:text-amber-600 flex items-center gap-2">
                                <FaEye className="w-5 h-5" />
                                Xem tất cả
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ trọ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm TB</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {topLandlords.map((landlord) => (
                                        <tr key={landlord.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img 
                                                        src={landlord.avatar} 
                                                        alt="" 
                                                        className="h-10 w-10 rounded-full mr-3"
                                                    />
                                                    <span className="font-medium text-gray-900">
                                                        {landlord.first_name} {landlord.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{landlord.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{landlord.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderStars(landlord.average_rating)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {landlord.average_rating.toFixed(1)}
                                                </span>
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

export default AdminOverview;
