import React from 'react';
import '../../../output.css';
import Item from '../../DefaultLayout/Item';
import Button from '../../DefaultLayout/Button';

const ListPost = () => {
    return (
        <div className="w-full border-blue-600 bg-white shadow-md rounded-md ">
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
                <Item />
                <Item />
                <Item />
                <Item />
            </div>
        </div>
    );
};

export default ListPost;
