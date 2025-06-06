import React, { useState } from 'react';
import axios from 'axios';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';
import RoomSearchResult from './RoomSearchResult';
import { endpoints } from '../API';

const ChatBot = () => {
    const [question, setQuestion] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            type: 'answer', 
            text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    const API_KEY = 'AIzaSyCBPja5XKspahQL_sh7nWDOEng2dEEwnVM';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const BACKEND_API = `http://127.0.0.1:8000${endpoints.post}`; 

    const extractSearchParams = (text) => {
        const params = {
            room_type: null,
            location: {
                city: null,
                district: null,
                ward: null
            },
            price: {
                min: null,
                max: null
            },
            area: {
                min: null,
                max: null
            },
            amenities: []
        };

        const textLower = text.toLowerCase().trim();

        // 1. Xử lý loại phòng
        if (textLower.includes('phòng trọ') || textLower.includes('nhà trọ')) 
            params.room_type = 'Phòng trọ';
        else if (textLower.includes('nhà nguyên căn')) 
            params.room_type = 'Nhà nguyên căn';
        else if (textLower.includes('căn hộ dịch vụ') || textLower.includes('căn hộ')) 
            params.room_type = 'Căn hộ dịch vụ';
        else if (textLower.includes('chung cư')) 
            params.room_type = 'Chung cư';

        // 2. Xử lý giá cả
        const pricePatterns = [
            // Từ X đến Y triệu
            {
                regex: /(?:từ|tu|trên|tren|hơn|hon)\s*(\d+)\s*(?:triệu|tr)?\s*(?:đến|tới|den|toi)\s*(\d+)\s*triệu/,
                handler: (matches) => {
                    params.price.min = parseInt(matches[1]) ;
                    params.price.max = parseInt(matches[2]);
                }
            },
            // Dưới/Không quá X triệu
            {
                regex: /(?:dưới|duoi|thấp hơn|thap hon|không quá|khong qua)\s*(\d+)\s*triệu/,
                handler: (matches) => {
                    params.price.max = parseInt(matches[1]);
                }
            },
            // Trên/Từ X triệu
            {
                regex: /(?:từ|từ|trên|tren|hơn|hon|lớn hơn|lon hon)\s*(\d+)\s*triệu/,
                handler: (matches) => {
                    params.price.min = parseInt(matches[1]) ;
                }
            },
            // Khoảng X triệu
            {
                regex: /(?:khoảng|khoang|giá|gia)\s*(\d+)\s*triệu/,
                handler: (matches) => {
                    const price = parseInt(matches[1]);
                    params.price.min = (price - 1) ;
                    params.price.max = (price + 1);
                }
            }
        ];

        // 3. Xử lý diện tích
        const areaPatterns = [
            // Từ X đến Y mét vuông
            {
                regex: /(?:từ|tu|trên|tren)\s*(\d+)\s*(?:m2|m²|mét vuông)?\s*(?:đến|tới|den|toi)\s*(\d+)\s*(?:m2|m²|mét vuông)?/,
                handler: (matches) => {
                    params.area.min = parseInt(matches[1]);
                    params.area.max = parseInt(matches[2]);
                }
            },
            // Dưới X mét vuông
            {
                regex: /(?:dưới|duoi|thấp hơn|thap hon|không quá|khong qua)\s*(\d+)\s*(?:m2|m²|mét vuông)/,
                handler: (matches) => {
                    params.area.max = parseInt(matches[1]);
                }
            },
            // Trên X mét vuông
            {
                regex: /(?:trên|tren|hơn|hon|lớn hơn|lon hon)\s*(\d+)\s*(?:m2|m²|mét vuông)/,
                handler: (matches) => {
                    params.area.min = parseInt(matches[1]);
                }
            },
            // Khoảng X mét vuông
            {
                regex: /khoảng\s*(\d+)\s*(?:m2|m²|mét vuông)/,
                handler: (matches) => {
                    const area = parseInt(matches[1]);
                    params.area.min = area - 5;
                    params.area.max = area + 5;
                }
            }
        ];

        // 4. Xử lý địa điểm
        const locationPatterns = [
            // Thành phố/Tỉnh
            {
                regex: /(?:tại|ở|trong)?\s*((?:thành phố|tp|tỉnh)\s+[^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    const cityName = matches[1].trim();
                    if (cityName.match(/(?:tp|thành phố)\s*hồ?\s*chí?\s*minh/i)) {
                        params.location.city = 'Thành phố Hồ Chí Minh';
                    }
                }
            },
            // Quận/Huyện (số)
            {
                regex: /(?:quận|quan)\s+(\d+)(?:,|\s|$)/i,
                handler: (matches) => {
                    const districtNumber = matches[1];
                    params.location.district = `Quận ${districtNumber}`;
                }
            },
            // Quận/Huyện (chữ)
            {
                regex: /(?:quận|quan|huyện|huyen|thị xã|thi xa)\s+([^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    let districtName = matches[1].trim();
                    districtName = cleanLocationName(districtName);
                    const prefix = matches[0].toLowerCase().includes('thị xã') ? 'Thị xã' :
                                 matches[0].toLowerCase().includes('quận') ? 'Quận' : 'Huyện';
                    params.location.district = `${prefix} ${capitalizeFirstLetter(districtName)}`;
                }
            },
            // Phường/Xã
            {
                regex: /(?:phường|phuong|xã|xa|thị trấn|thi tran)\s+([^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    if (!textLower.includes('thị xã')) {
                        let wardName = matches[1].trim();
                        wardName = cleanLocationName(wardName);
                        const prefix = matches[0].toLowerCase().includes('phường') ? 'Phường' :
                                    matches[0].toLowerCase().includes('thị trấn') ? 'Thị trấn' : 'Xã';
                        params.location.ward = `${prefix} ${capitalizeFirstLetter(wardName)}`;
                    }
                }
            }
        ];

        // 5. Xử lý tiện ích
        const amenities = [
            'máy lạnh', 'wifi', 'tủ lạnh', 'máy giặt', 'ban công', 
            'camera', 'bảo vệ', 'thang máy', 'giường', 'tủ quần áo',
            'bếp', 'nhà vệ sinh riêng'
        ];

        amenities.forEach(item => {
            if (textLower.includes(item)) {
                params.amenities.push(item);
            }
        });

        // Áp dụng tất cả patterns
        [...pricePatterns, ...areaPatterns, ...locationPatterns].forEach(pattern => {
            const matches = textLower.match(pattern.regex);
            if (matches) {
                pattern.handler(matches);
            }
        });

        // Chuyển đổi kết quả sang format API
        const apiParams = {};
        if (params.room_type) apiParams.room_type = params.room_type;
        if (params.location.city) apiParams.city = params.location.city;
        if (params.location.district) apiParams.district = params.location.district;
        if (params.location.ward) apiParams.ward = params.location.ward;
        if (params.price.min) apiParams.min_price = params.price.min;
        if (params.price.max) apiParams.max_price = params.price.max;
        if (params.area.min) apiParams.min_area = params.area.min;
        if (params.area.max) apiParams.max_area = params.area.max;
        if (params.amenities.length > 0) apiParams.amenities = params.amenities;

        return Object.keys(apiParams).length > 0 ? apiParams : null;
    };

    // Helper functions
    const cleanLocationName = (name) => {
        const exclusionWords = [
            'dưới', 'trên', 'hơn', 'lớn hơn', 'nhỏ hơn',
            'cao hơn', 'thấp hơn', 'khoảng', 'từ', 'đến',
            'tối đa', 'tối thiểu', 'không quá'
        ];
        const regex = new RegExp(`\\b(${exclusionWords.join('|')})\\b`, 'gi');
        return name.replace(regex, '').trim();
    };

    const capitalizeFirstLetter = (string) => {
        return string
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const handleSubmit = async () => {
        if (!question.trim()) return;

        const newMessages = [...messages, {
            type: 'question',
            text: question,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }];
        setMessages(newMessages);

        const params = extractSearchParams(question);

        if (params) {
            try {
                const res = await axios.get(BACKEND_API, { params });
                if (res.data.results && res.data.results.length > 0) {
                    setMessages([...newMessages, {
                        type: 'room_results',
                        posts: res.data.results.slice(0, 3),
                        totalCount: res.data.results.length,
                        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    }]);
                } else {
                    setMessages([...newMessages, {
                        type: 'answer',
                        text: 'Không tìm thấy phòng phù hợp.',
                        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    }]);
                }
            } catch (err) {
                console.error('Error fetching posts:', err);
                setMessages([...newMessages, {
                    type: 'answer',
                    text: 'Có lỗi khi truy vấn dữ liệu phòng trọ.',
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } else {
            try {
                const response = await axios.post(API_URL, {
                    contents: [{ parts: [{ text: question }] }],
                });
                const answer = response.data.candidates[0].content.parts[0].text;
                setMessages([...newMessages, {
                    type: 'answer',
                    text: answer,
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                }]);
            } catch (error) {
                setMessages([...newMessages, {
                    type: 'answer',
                    text: 'Xin lỗi, đã có lỗi xảy ra!',
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        }
        setQuestion('');
    };
    const searchSuggestions = [
        {
            text: "Tìm phòng quận 1 dưới 5 triệu",
            params: { district: "Quận 1", maxPrice: 5000000 }
        },
        {
            text: "Phòng trọ Tân Bình có máy lạnh",
            params: { district: "Tân Bình", amenities: ["máy lạnh"] }
        },
        // Thêm các gợi ý khác...
    ];

    const MessageBubble = ({ msg }) => (
        <div className={`flex w-full ${msg.type === 'question' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className="flex flex-col" style={{ maxWidth: '75%' }}>
                {msg.type === 'answer' && (
                    <div className="text-lg text-gray-500 mb-1 ml-2 font-bold">AI</div>
                )}
                <div
                    className={`relative p-3 rounded-[20px] shadow-sm
                        ${msg.type === 'question' 
                            ? 'bg-red-500 text-white border-2 border-red-200' 
                            : 'bg-gray-100 text-gray-800 border-2 border-gray-200'
                        }`}
                >
                    {msg.type === 'room_results' ? (
                        <div className="space-y-2">
                            <p className="mb-2">Tôi tìm thấy {msg.posts.length} phòng phù hợp:</p>
                            {msg.posts.map((post) => (
                                <RoomSearchResult key={post.id} post={post} />
                            ))}
                            {msg.totalCount > msg.posts.length && (
                                <p className="text-sm text-gray-500 mt-2">
                                    ...và {msg.totalCount - msg.posts.length} phòng khác
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="break-words whitespace-pre-wrap text-xl">
                            {msg.text}
                        </div>
                    )}
                    <div className={`text-[10px] ${msg.type === 'question' ? 'text-red-200' : 'text-gray-500'} mt-1`}>
                        {msg.timestamp}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-36 right-8 z-[9999]"> {/* Thay đổi bottom và z-index */}
            {!isOpen ? (
                <button
                    className="bg-red-500 p-4 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <FaCommentDots size={24} />
                </button>
            ) : (
                <div className="bg-white shadow-lg rounded-lg w-[380px] h-[450px] flex flex-col overflow-hidden border border-gray-300">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-red-600 text-white p-3 h-[50px] flex-shrink-0 rounded-t-lg">
                        
                        <h1 className="text-xl font-semibold">Chat Support</h1>
                        <button
                            className="hover:text-gray-200 transition"
                            onClick={() => setIsOpen(false)}    
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                
                    {/* Messages container */}
                    <div className="flex-1 overflow-hidden"> {/* Add overflow-hidden */}
                        <div className="h-full overflow-y-auto px-4 py-2"> {/* Add h-full and change padding */}
                            {messages.map((msg, index) => (
                                <MessageBubble key={index} msg={msg} />
                            ))}
                        </div>
                    </div>
                    <div className="px-3 pb-2">
                        <div className="flex flex-wrap gap-2">
                            {searchSuggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
                                    onClick={() => setQuestion(suggestion.text)}
                                >
                                    {suggestion.text}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Input container */}
                    <div className="border-t border-gray-200 p-3 bg-gray-100 rounded-b-lg">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                placeholder="Nhập câu hỏi của bạn..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <button
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors flex-shrink-0"
                                onClick={handleSubmit}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
