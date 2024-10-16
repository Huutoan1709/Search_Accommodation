import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { FaUserAlt, FaClipboardList, FaUsers, FaWarehouse } from 'react-icons/fa';
import API, { authApi, endpoints } from '../../API';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AdminOverview = () => {
    const [userCount, setUserCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [landlordCount, setLandlordCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [postStatistics, setPostStatistics] = useState({ locked: 0, active: 0, hidden: 0 });
    const [topLandlords, setTopLandlords] = useState([]);
    const [cityPostCounts, setCityPostCounts] = useState({});
    const currentDate = new Date();
    const [startDate, setStartDate] = useState(new Date(currentDate.getFullYear(), 0, 1));
    const [endDate, setEndDate] = useState(currentDate);

    useEffect(() => {
        fetchCounts();
        fetchPostStatistics();
        fetchTopLandlords();
    }, [startDate, endDate]);

    const fetchCounts = async () => {
        try {
            const userResponse = await API.get(endpoints.listuser);
            const userData = userResponse.data;

            setUserCount(userData.count);
            const customers = userData.results.filter((user) => user.role === 'CUSTOMER');
            const landlords = userData.results.filter((user) => user.role === 'LANDLORD');
            setCustomerCount(customers.length);
            setLandlordCount(landlords.length);

            const postResponse = await authApi().get(`${endpoints.post}?all=true`);
            setPostCount(postResponse.data.count);
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    const fetchPostStatistics = async () => {
        try {
            const response = await authApi().get(`${endpoints.post}?all=true`);
            const posts = response.data.results;

            // Cập nhật endDate nếu nó cùng tháng và năm với startDate
            const adjustedEndDate =
                startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()
                    ? new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0) // Ngày cuối cùng của tháng
                    : endDate;

            const filteredPosts = posts.filter((post) => {
                const postDate = new Date(post.created_at);
                return postDate >= startDate && postDate <= adjustedEndDate;
            });

            let locked = 0;
            let active = 0;
            let hidden = 0;

            const cityCounts = {};

            filteredPosts.forEach((post) => {
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

    const donutData = {
        labels: ['Khóa', 'Đang hoạt động', 'Ẩn'],
        datasets: [
            {
                label: 'Số lượng tin đăng',
                data: [postStatistics.locked, postStatistics.active, postStatistics.hidden],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFA07A'],
            },
        ],
    };

    const cityCountsArray = Object.entries(cityPostCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10);

    const barData = {
        labels: cityCountsArray.map(([city]) => city),
        datasets: [
            {
                label: 'Số lượng tin đăng',
                data: cityCountsArray.map(([, count]) => count),
                backgroundColor: '#36A2EB',
            },
        ],
    };

    const renderStars = (rating) => {
        const numStars = Math.round(rating);
        return (
            <div>
                {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} className={index < numStars ? 'text-yellow-500' : 'text-gray-400'}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="p-8 bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">TỔNG QUAN THỐNG KÊ</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
                    <div className="rounded-full p-5 bg-blue-200 w-20 h-20">
                        <FaUserAlt className="text-blue-500 text-3xl mb-2" />
                    </div>
                    <p className="text-[20px] font-bold p-5">{userCount}</p>
                    <h3 className="text-xl font-semibold">Người dùng</h3>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
                    <div className="rounded-full p-5 bg-blue-200 w-20 h-20">
                        <FaClipboardList className="text-purple-600 text-3xl mb-2" />
                    </div>
                    <p className="text-[20px] font-bold p-5">{postCount}</p>
                    <h3 className="text-xl font-semibold">Tin đăng</h3>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
                    <div className="rounded-full p-5 bg-blue-200 w-20 h-20">
                        <FaUsers className="text-green-500 text-4xl mb-2" />
                    </div>
                    <p className="text-[20px] font-bold p-5">{customerCount}</p>
                    <h3 className="text-xl font-semibold">Khách hàng</h3>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
                    <div className="rounded-full p-5 bg-blue-200 w-20 h-20">
                        <FaWarehouse className="text-orange-500 text-4xl mb-2" />
                    </div>
                    <p className="text-[20px] font-bold p-5">{landlordCount}</p>
                    <h3 className="text-xl font-semibold">Chủ trọ</h3>
                </div>
            </div>
            <div className="flex items-center justify-center gap-5">
                <h3 className="text-2xl font-semibold mb-5">Chọn khoảng thời gian thống kê</h3>
                <div className="flex space-x-4 mb-4">
                    <DatePicker
                        className="p-2 bg-yellow-50 cursor-pointer items-center text-black"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        placeholderText="Chọn tháng/năm bắt đầu"
                    />
                    <DatePicker
                        className="p-2 bg-yellow-50 cursor-pointer items-center  text-black"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        placeholderText="Chọn tháng/năm kết thúc"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="relative bg-white shadow-lg rounded-lg p-6 w-full h-full flex items-center justify-center">
                    <h3 className=" text-2xl font-semibold mb-auto">Trạng thái tin đăng</h3>
                    <div className="w-full h-full mt-20 mr-28">
                        <Doughnut data={donutData} />
                    </div>
                </div>

                <div className="relative bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-20">Số bài đăng theo thành phố</h3>
                    <div>
                        <Bar data={barData} />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-center">Top 5 Chủ trọ được đánh giá cao</h3>
                <table className="min-w-full border-collapse items-center">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-4 border text-center">Avatar</th>
                            <th className="px-4 py-4 border text-center">Tên</th>
                            <th className="px-4 py-4 border text-center">Email</th>
                            <th className="px-4 py-4 border text-center">Số điện thoại</th>
                            <th className="px-4 py-4 border text-center">Đánh giá</th>
                            <th className="px-4 py-4 border text-center">Điểm trung bình</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topLandlords.map((landlord) => (
                            <tr key={landlord.id} className="border border-b border-gray-200">
                                <td className="px-4 py-4 text-center bg-yellow-50 text-2xl">
                                    <img src={landlord.avatar} alt="Avatar" className="w-20 h-20 rounded-full ml-3" />
                                </td>
                                <td className="px-4 py-4 text-center bg-yellow-50 text-2xl">
                                    {landlord.first_name} {landlord.last_name}
                                </td>
                                <td className="px-4 py-4 text-center bg-yellow-50 text-2xl">{landlord.email}</td>
                                <td className="px-4 py-4 text-center bg-yellow-50 text-2xl">{landlord.phone}</td>
                                <td className="px-4 py-4 text-center bg-yellow-50 text-2xl">
                                    {renderStars(landlord.average_rating)}
                                </td>
                                <td className="px-4 py-4 text-center bg-yellow-50 text-2xl">
                                    {landlord.average_rating.toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOverview;
