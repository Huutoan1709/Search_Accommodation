import React from 'react';

function Footer() {
    return (
        <footer className="bg-white border-t mt-10">
            <div className="container max-w-[1024px] py-8 items-center justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {/* Cột 1 - Về BDS123 */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4">VỀ BDS123.VN</h3>
                        <ul>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Trang chủ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Giới thiệu
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Tuyển dụng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Quy chế hoạt động
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Quy định sử dụng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Chính sách bảo mật
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Liên hệ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 2 - Hỗ trợ khách hàng */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4">HỖ TRỢ KHÁCH HÀNG</h3>
                        <ul>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Tin tức & Khuyến mãi
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Bảng giá dịch vụ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Hướng dẫn đăng tin
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Quy định đăng tin
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Chính sách giải quyết khiếu nại
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 3 - Nhà đất bán */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4">NHÀ ĐẤT BÁN</h3>
                        <ul>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Bán căn hộ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Bán nhà riêng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Bán nhà mặt tiền
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Bán biệt thự
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Bán đất
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Bán nhà trọ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 4 - Nhà đất cho thuê */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4">NHÀ ĐẤT CHO THUÊ</h3>
                        <ul>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Cho thuê căn hộ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-yellow-500">
                                    Thuê nhà nguyên căn
                                </a>
                            </li>
                            <li>
                                <span href="#" className="text-gray-600 hover:text-yellow-500">
                                    Thuê nhà mặt tiền
                                </span>
                            </li>
                            <li>
                                <span className="text-gray-600 hover:text-yellow-500">Phòng trọ</span>
                            </li>
                            <li>
                                <span className="text-gray-600 hover:text-yellow-500">Văn phòng</span>
                            </li>
                            <li>
                                <a className="text-gray-600 hover:text-yellow-500">Ở ghép</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Phần dưới cùng */}
                <div className="mt-8 flex justify-between items-center border-t pt-4">
                    <div className="text-sm text-gray-600 items-center">
                        <p>Copyright © 2016 - 2024 TO.vn</p>
                        <p>Một sản phẩm của TO</p>
                        <p>Email: lienhe@TO1235.vn</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
