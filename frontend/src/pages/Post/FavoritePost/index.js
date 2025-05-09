import React, { useEffect, useState } from 'react';
import Header from '../../DefaultLayout/Header';
import { authApi, endpoints } from '../../../API';
import Loading from '../../../components/Loading';
import { motion } from 'framer-motion';
import { FaBoxOpen } from 'react-icons/fa';
import Footer from '../../DefaultLayout/footer';
import NewPost from '../../DefaultLayout/NewPost';
import Item from '../../DefaultLayout/Item';

const EmptyState = () => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-12 text-center"
    >
        <FaBoxOpen className="text-gray-400 text-7xl mx-auto mb-6"/>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">
            Chưa có tin đã lưu
        </h3>
        <p className="text-gray-500 max-w-md mx-auto text-lg">
            Bạn chưa lưu tin đăng nào. Hãy lưu những tin đăng yêu thích để xem lại sau!
        </p>
    </motion.div>
);

const FavoritePost = () => {
    const [favoritePosts, setFavoritePosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await authApi().get(endpoints['myfavorite']);
                setFavoritePosts(res.data);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu tin đã lưu:', error);
                setError('Không thể tải danh sách tin đã lưu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div>
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <Loading message="Đang tải danh sách tin đã lưu..." />
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="w-[70%] mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="text-red-500 text-xl mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-lg">{error}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="w-[1280px] mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tin đã lưu 
                        <span className="text-gray-500 text-2xl ml-2">
                            ({favoritePosts.length})
                        </span>
                    </h1>
                </div>

                <div className="flex gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {favoritePosts.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-4"
                            >
                                {favoritePosts.map((post) => (
                                    <Item
                                        key={post.id}
                                        id={post.id}
                                        images={post.images}
                                        title={post.title}
                                        content={post.content}
                                        room={post.room}
                                        created_at={post.created_at}
                                        user={post.user}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <EmptyState />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-[30%] space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                                Hỗ trợ tiện ích
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Tư vấn phong thủy',
                                    'Dự tính chi phí làm nhà',
                                    'Tính lãi suất',
                                    'Quy trình xây nhà',
                                    'Xem tuổi làm nhà'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className=" bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                                Tin mới đăng
                            </h3>
                            <NewPost />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default FavoritePost;
