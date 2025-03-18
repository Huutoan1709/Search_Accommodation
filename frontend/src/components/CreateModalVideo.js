import React, { useState } from 'react';
import { FaVideo } from 'react-icons/fa';
import { authApi, endpoints } from '../API';
import { notifyError, notifySuccess } from './ToastManager';

const CreateModalVideo = ({ isOpen, onClose, postId }) => {
    const [video, setVideo] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleVideoUpload = async () => {
        if (!video) {
            alert('Vui lòng chọn video trước khi tải lên.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('video', video);

            await authApi().post(endpoints.postvideo(postId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            notifySuccess('Tải lên video thành công!');
            onClose();
        } catch (error) {
            console.error('Lỗi khi tải lên video:', error);
            notifyError('Tải video lên thất bại.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                <h2 className="text-2xl font-semibold text-center mb-4 text-red-400">Thêm video cho bài đăng</h2>
                <p className="text-center text-gray-700 mb-4">Thêm video cho bài đăng để tăng độ tin cậy</p>
                <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 p-6 rounded-lg w-full cursor-pointer hover:bg-gray-100"
                    onClick={() => document.getElementById('videoUpload').click()}
                >
                    <FaVideo className="text-4xl text-gray-500 mb-2" />
                    <span className="text-red-400 font-bold">
                        {video ? `Đã tải lên 1 video: ${video.name}` : 'Nhấp để tải lên video'}
                    </span>
                </div>
                <input
                    type="file"
                    id="videoUpload"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files[0])}
                    className="hidden"
                />
                <div className="flex justify-between w-full mt-4">
                    <button
                        onClick={handleVideoUpload}
                        className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200"
                        disabled={uploading}
                    >
                        {uploading ? 'Đang tải lên...' : 'Tải lên'}
                    </button>
                    <button onClick={onClose} className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200">
                        Bỏ qua
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateModalVideo;
