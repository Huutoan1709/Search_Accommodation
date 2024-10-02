import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const UpdatePost = ({ isOpen, onClose, roomDetails, onUpdate }) => {
    const [postTitle, setPostTitle] = useState(roomDetails.title);
    const [postContent, setPostContent] = useState(roomDetails.content);
    const [images, setImages] = useState([]);

    const handleUpdate = (e) => {
        e.preventDefault();
        const updatedPost = {
            title: postTitle,
            content: postContent,
            images: images,
        };
        onUpdate(updatedPost);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Chỉnh Sửa Bài Đăng</h2>
                    <button onClick={onClose}>
                        <FaTimes className="text-red-500" />
                    </button>
                </div>
                <form onSubmit={handleUpdate}>
                    <label className="block text-gray-600">Tiêu đề</label>
                    <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        className="border border-gray-300 p-3 rounded-lg w-full mb-4"
                    />
                    <label className="block text-gray-600">Nội dung</label>
                    <CKEditor
                        editor={ClassicEditor}
                        data={postContent}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setPostContent(data);
                        }}
                        className="border border-gray-300 rounded-lg w-full mb-4"
                    />
                    <label className="block text-gray-600">Hình ảnh</label>
                    <div className="min-h-[180px] border-dashed border-2 border-gray-300 p-6 flex justify-center items-center mb-4">
                        <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
                            <span className="mt-2 font-medium text-blue-500">Thêm Ảnh</span>
                        </label>
                        <input
                            id="upload"
                            type="file"
                            multiple
                            onChange={(e) => setImages(Array.from(e.target.files))}
                            className="hidden"
                        />
                    </div>
                    <button
                        type="submit"
                        className="font-semibold bg-red-500 text-white px-4 py-2 rounded-lg w-full hover:bg-red-600 transition duration-300"
                    >
                        Cập nhật bài đăng
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePost;
