import React, { useEffect, useState } from 'react';
import API, { endpoints } from '../../API';
import { useNavigate } from 'react-router-dom';
import './HomeStyle.scss';
import '../../output.css';
import { search } from '../DefaultLayout/Search';
import Header from '../DefaultLayout/Header';
import ListPost from '../Post/ListPost';

function Home() {
    const [data, setData] = useState('');
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useState({
        roomType: '',
        price: '',
        area: '',
    });

    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await API.get(endpoints['post'], {
                    params: { page: currentPage },
                });
                setData(result.data.results);
                setTotalPages(result.data.total_pages);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };
    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleInputChange = (e) => {
        setSearchParams((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="bg-slate-50">
            <Header />
            <div className="w-[1024px] flex m-auto">
                <div className="flex w-full gap-4">
                    <div className="w-[70%]">
                        <ListPost />
                    </div>
                    <div className="w-[30%] border border-green-400">
                        <p>sidebar</p>
                    </div>
                </div>
            </div>
        </div>

        // <div>
        //   <Header />
        //   {/* Main Content */}
        //   <div className="content">
        //     <div className="container">
        //       <search></search>
        //       <h2>Tất cả phòng trên toàn quốc</h2>
        //       {data && data.length > 0 ? (
        //         <div className="listings">
        //           {data.map((item) => (
        //             <div
        //               key={item.id}
        //               className="listing-card"
        //               onClick={() => handlePostClick(item.id)}
        //             >
        //               <img
        //                 src={item.images[0]?.url}
        //                 alt={item.title}
        //                 className="listing-image"
        //               />
        //               <div className="listing-details">
        //                 <h3>{item.title}</h3>
        //                 <p>{item.description}</p>
        //                 <p>Giá: {item.room.price} Triệu/Tháng</p>
        //                 <p>Diện tích: {item.room.area} m²</p>
        //                 <p>Loại phòng: {item.room.room_type}</p>
        //                 <p>Ngày đăng: {item.created_at}</p>
        //                 <p>
        //                   Địa chỉ: {item.room.district}, {item.room.city}
        //                 </p>
        //               </div>
        //             </div>
        //           ))}
        //         </div>
        //       ) : (
        //         <p>No listings available</p>
        //       )}

        //       {/* Pagination */}
        //       <div className="pagination">
        //         <button onClick={() => handlePageChange(currentPage - 1)}>
        //           Previous
        //         </button>
        //         <span>
        //           Page {currentPage} of {totalPages}
        //         </span>
        //         <button onClick={() => handlePageChange(currentPage + 1)}>
        //           Next
        //         </button>
        //       </div>
        //     </div>
        //   </div>
        // </div>
    );
}

export default Home;
