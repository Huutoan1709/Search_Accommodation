import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { notifyError, notifySuccess } from '../../../components/ToastManager';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const UpdatePost = ({ post, onUpdate, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [hiddenImages, setHiddenImages] = useState([]);
    const [video, setVideo] = useState(null);
    const [newVideo, setNewVideo] = useState(null);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setImages(post.images);
            setVideo(post.video || null);
            setDeletedImages([]);
            setHiddenImages([]);
        }
    }, [post]);

    const handleDeleteImage = (imageIndex) => {
        const remainingImagesCount = images.length - hiddenImages.length - 1;

        if (remainingImagesCount < 4) {
            notifyError('Không thể xóa, phải có ít nhất 4 hình ảnh.');
            return;
        }

        setHiddenImages((prev) => [...prev, images[imageIndex].id]);
    };

    const handleNewImageChange = (e) => {
        setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
    };

    const handleNewVideoChange = (e) => {
        if (e.target.files.length > 0) {
            setNewVideo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await authApi().patch(endpoints.updatepost(post.id), { title, content });

            const formData = new FormData();
            images.forEach((img) => !hiddenImages.includes(img.id) && formData.append('images', img));
            newImages.forEach((img) => formData.append('images', img));

            if (newImages.length > 0) {
                await authApi().post(endpoints.postimage(post.id), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            await Promise.all(hiddenImages.map((id) => authApi().delete(endpoints.deleteImage(post.id, id))));

            if (newVideo) {
                // Xóa video cũ nếu có
                if (video) {
                    await authApi().delete(endpoints.deletevideo(post.id));
                }

                // Upload video mới
                const videoFormData = new FormData();
                videoFormData.append('video', newVideo);
                await authApi().post(endpoints.postvideo(post.id), videoFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            notifySuccess('Cập nhật bài đăng thành công.');
            await onUpdate();
            window.location.reload();
            onClose();
        } catch (error) {
            console.error('Cập nhật bài đăng thất bại:', error);
            notifyError('Cập nhật bài đăng thất bại.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[650px] h-[650px] overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Cập nhật bài đăng</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block text-gray-600 mb-2">Tiêu đề:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="border p-2 rounded-lg w-full mb-4"
                    />
                    <label className="block text-gray-600 mb-2">Nội dung:</label>
                    <CKEditor
                        editor={ClassicEditor}
                        data={content}
                        onChange={(event, editor) => setContent(editor.getData())}
                    />

                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Hình ảnh:</label>
                        <div className="grid grid-cols-3 gap-2">
                            {images.map(
                                (img, idx) =>
                                    !hiddenImages.includes(img.id) && (
                                        <div key={idx} className="relative">
                                            <img
                                                src={img.url}
                                                alt={`Ảnh ${idx + 1}`}
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                            {images.length - hiddenImages.length > 4 && (
                                                <button
                                                    onClick={() => handleDeleteImage(idx)}
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ),
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Thêm hình ảnh:</label>
                        <input type="file" multiple onChange={handleNewImageChange} className="border p-2 w-full" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Video hiện tại:</label>
                        {video && <video src={video} controls className="w-full h-40 object-cover rounded-lg" />}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Tải lên video mới:</label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleNewVideoChange}
                            className="border p-2 w-full"
                        />
                    </div>

                    <div className="flex justify-between mt-4">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Cập nhật
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                            Đóng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePost;
