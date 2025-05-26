import React from 'react';
import { BiTime } from 'react-icons/bi';
import { MdWarning } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';

const ExpiredPostsModal = ({ isOpen, onClose, expiredPosts }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="relative w-full max-w-2xl mx-auto">
                {/* Modal content */}
                <div className="relative bg-white rounded-xl shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
                                <MdWarning className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900">
                                Cảnh báo tin đăng hết hạn
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                            <IoMdClose className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4">
                        <div className="mb-4">
                            <p className="text-lg text-gray-600">
                                Bạn có <span className="font-semibold text-red-600">{expiredPosts.length} tin đăng</span> đã hết hạn và cần được gia hạn:
                            </p>
                        </div>
                        
                        {/* Expired posts list */}
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {expiredPosts.map((post) => (
                                <div 
                                    key={post.id} 
                                    className="bg-gray-50 rounded-lg p-4 border border-yellow-200 hover:border-yellow-500 transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 text-xl mb-1">
                                                {post.title}
                                            </h4>
                                            <div className="flex items-center gap-4 text-lg">
                                                <span className="text-green-600 font-medium">
                                                    {post.room?.price} triệu/tháng
                                                </span>
                                                <span className="text-gray-500">
                                                    ID: #{post.id}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                            <BiTime className="mr-1" />
                                            <span className="text-lg font-medium">
                                                Hết hạn: {new Date(post.expires_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
    );
};

export default ExpiredPostsModal;