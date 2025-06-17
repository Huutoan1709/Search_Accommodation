import React from 'react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import Logomotel from '../../assets/Logomotel.png';

function Footer() {
    return (
        <footer className="bg-white border-t mt-10">
            <div className="container max-w-[1024px] mx-auto py-6 px-4">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {/* Logo & Social */}
                    <div className="text-center sm:text-left">
                        {/* Logo */}
                        <div className="w-32 mx-auto sm:mx-0 mb-4">
                            <img 
                                src={Logomotel} 
                                alt="TO_ACCOMMODATION Logo"
                                className="w-full h-auto object-contain"
                            />
                            <p className="text-gray-600 mt-2 text-sm font-medium">
                                TO_ACCOMMODATION
                            </p>
                        </div>
                        
                        {/* Social Icons */}
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-[#0d3d5c] text-white rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"
                            >
                                <FaFacebookF size={20} />
                            </a>
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-10 h-10 bg-[#0d3d5c] text-white rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"
                            >
                                <FaInstagram size={20} />
                            </a>
                            <a 
                                href="https://zalo.me" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-[#0d3d5c] text-white rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors" 
                            >
                                <SiZalo size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Liên Kết Nhanh
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Trang chủ
                                </a>
                            </li>
                            <li>
                                <a href="/phong-tro" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Phòng trọ
                                </a>
                            </li>
                            <li>
                                <a href="/chung-cu" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Chung cư
                                </a>
                            </li>
                            <li>
                                <a href="/can-ho-dich-vu" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Căn hộ dịch vụ 
                                </a>
                            </li>
                            <li>
                                <a href="/nha-nguyen-can" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Nhà nguyên căn
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Functions */}
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Chức Năng
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/voice-search" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Tìm kiếm bằng giọng nói
                                </a>
                            </li>
                            <li>
                                <a href="/nearby-search" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Tìm kiếm xung quanh
                                </a>
                            </li>
                            <li>
                                <a href="/map-view" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Xem trên bản đồ
                                </a>
                            </li>
                            <li>
                                <a href="/advanced-filter" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    Lọc nâng cao
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-8"></div>

                {/* Disclaimer */}
                <div className="text-center text-lg text-gray-600 mb-6">
                    <p className="mb-4 max-w-4xl mx-auto">
                        TO_ACCOMMODATION là nền tảng đăng tin cho thuê phòng trọ, không phải đơn vị môi giới. 
                        Chúng tôi không chịu trách nhiệm về tính chính xác của thông tin đăng tải và các tranh chấp 
                        phát sinh giữa các bên. Người dùng cần tự xác minh thông tin và thực hiện giao dịch thông qua 
                        hợp đồng văn bản.
                    </p>
                </div>

                {/* Copyright */}
                <div className="text-center text-lg text-gray-600">
                    <p className="mb-2">Copyright © {new Date().getFullYear()} TO_ACCOMMODATION</p>
                    <p>Email: nguyenhuutoan010@gmail.com</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
