import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../../API';
import { notifyError, notifySuccess } from '../../../components/ToastManager';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import uploadimage from '../../../assets/upload-image.png';

const UpdatePost = ({ post, onUpdate, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setImages(post.images);
            setDeletedImages([]);
        }
    }, [post]);

    const handleDeleteImage = (imageIndex) => {
        const remainingImagesCount = images.length - deletedImages.length - 1;

        if (remainingImagesCount < 4) {
            notifyError('Không thể xóa, phải có ít nhất 4 hình ảnh.');
            return;
        }

        const imageToDelete = images[imageIndex];
        setDeletedImages((prev) => [...prev, imageToDelete.id]);
    };

    const handleNewImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImages((prev) => [...prev, ...files]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const postData = {
                title,
                content,
            };
            await authApi().patch(endpoints.updatepost(post.id), postData);

            const formData = new FormData();
            images.forEach((image) => {
                if (!deletedImages.includes(image.id)) {
                    formData.append('images', image);
                }
            });
            newImages.forEach((newImage) => {
                formData.append('images', newImage);
            });

            if (newImages.length > 0) {
                await authApi().post(endpoints.postimage(post.id), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            await Promise.all(
                deletedImages.map(async (imageId) => {
                    await authApi().delete(endpoints.deleteImage(post.id, imageId));
                }),
            );
            notifySuccess('Cập nhật bài đăng thành công.');
            await onUpdate();
            window.location.reload();

            onClose();
        } catch (error) {
            console.error('Cập nhật bài đăng hoặc hình ảnh thất bại:', error);
            notifyError('Cập nhật bài đăng hoặc hình ảnh thất bại.');
        }
    };

    if (!post) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[650px] h-[550px] overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Cập nhật bài đăng</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block text-gray-600 mb-2">Tiêu đề:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="border border-gray-300 p-2 rounded-lg w-full mb-4"
                    />
                    <label className="block text-gray-600 mb-2">Nội dung:</label>
                    <CKEditor
                        editor={ClassicEditor}
                        data={content}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setContent(data);
                        }}
                    />
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Hình ảnh hiện tại:</label>
                        <div className="grid grid-cols-3 gap-2">
                            {images
                                .filter((image) => !deletedImages.includes(image.id))
                                .map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image.url}
                                            alt={`Hình ảnh ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            title="Xóa hình ảnh"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Thêm hình ảnh:</label>
                        <div className="min-h-[180px] border-dashed border-2 border-gray-300 p-6 flex justify-center items-center">
                            <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
                                <img src={uploadimage} alt="Upload" className="w-32 h-24 object-cover" />
                                <span className="mt-2 font-medium text-blue-500">Thêm Ảnh</span>
                            </label>
                            <input
                                id="upload"
                                type="file"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    setNewImages((prev) => [...prev, ...files]);
                                }}
                                className="hidden"
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-4 gap-4">
                            {newImages.map((file, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Hình ảnh mới ${index + 1}`}
                                        className="w-full h-40 object-cover border border-gray-300 rounded"
                                    />
                                    <button
                                        onClick={() => setNewImages(newImages.filter((_, i) => i !== index))}
                                        className="absolute top-1 right-1 bg-red-400 text-white p-1 rounded"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                            Cập nhật
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
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
