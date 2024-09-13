import React from 'react';
import '../../../output.css';
import Item from '../../DefaultLayout/Item';
import Button from '../../DefaultLayout/Button';
import API, { endpoints } from '../../../API';
import { useEffect, useState } from 'react';
import { json, useNavigate } from 'react-router-dom';

const ListPost = () => {
    const [data, setData] = useState('');
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
    return (
        <div className="w-full border-blue-600 shadow-md rounded-md bg-[#fff] ">
            <div className="flex items-centre justify-between my-3 pt-5 px-4">
                <h3 className="text-xl font-semibold">Danh Sách Tin Đăng</h3>
                <span>Cấp nhập : 12:05</span>
            </div>
            <div className="flex items-center gap-3 my-4 px-4">
                <span>sắp xếp:</span>
                <Button bgColor="bg-gray-200" text="mặc định" />
                <Button bgColor="bg-gray-200" text="mới nhất" />
            </div>

            <div className="items">
                {data?.length > 0 &&
                    data.map((item) => {
                        return (
                            <Item
                                key={item?.id}
                                room={item?.room}
                                title={item?.title}
                                content={item?.content}
                                created_at={item?.created_at}
                                images={item?.images}
                                user={item?.user}
                            />
                        );
                    })}
            </div>
        </div>
    );
};

export default ListPost;
