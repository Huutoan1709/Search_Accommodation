import React, { useState } from 'react';
import axios from 'axios';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';
import RoomSearchResult from './RoomSearchResult';
import { endpoints } from '../API';

// Thêm constant cho timeout
const TIMEOUT_DURATION = 30000; // 30 seconds

// Cập nhật axios configuration
const API = axios.create({
    timeout: TIMEOUT_DURATION,
    headers: {
        'Content-Type': 'application/json'
    }
});

const specialLocations = {
    // Thành phố trực thuộc Trung ương
    hcm: 'Thành phố Hồ Chí Minh',
    'sài gòn': 'Thành phố Hồ Chí Minh',
    sg: 'Thành phố Hồ Chí Minh',
    'hà nội': 'Thành phố Hà Nội',
    hn: 'Thành phố Hà Nội',
    'hải phòng': 'Thành phố Hải Phòng',
    hp: 'Thành phố Hải Phòng',
    'đà nẵng': 'Thành phố Đà Nẵng',
    dn: 'Thành phố Đà Nẵng',
    'cần thơ': 'Thành phố Cần Thơ',
    ct: 'Thành phố Cần Thơ',

    // Các tỉnh miền Bắc
    'hà giang': 'Tỉnh Hà Giang',
    'cao bằng': 'Tỉnh Cao Bằng',
    'bắc kạn': 'Tỉnh Bắc Kạn',
    'tuyên quang': 'Tỉnh Tuyên Quang',
    'lào cai': 'Tỉnh Lào Cai',
    'điện biên': 'Tỉnh Điện Biên',
    'lai châu': 'Tỉnh Lai Châu',
    'sơn la': 'Tỉnh Sơn La',
    'yên bái': 'Tỉnh Yên Bái',
    'hoà bình': 'Tỉnh Hoà Bình',
    'thái nguyên': 'Tỉnh Thái Nguyên',
    'lạng sơn': 'Tỉnh Lạng Sơn',
    'quảng ninh': 'Tỉnh Quảng Ninh',
    'bắc giang': 'Tỉnh Bắc Giang',
    'phú thọ': 'Tỉnh Phú Thọ',
    'vĩnh phúc': 'Tỉnh Vĩnh Phúc',
    'bắc ninh': 'Tỉnh Bắc Ninh',
    'hải dương': 'Tỉnh Hải Dương',
    'hưng yên': 'Tỉnh Hưng Yên',
    'thái bình': 'Tỉnh Thái Bình',
    'hà nam': 'Tỉnh Hà Nam',
    'nam định': 'Tỉnh Nam Định',
    'ninh bình': 'Tỉnh Ninh Bình',

    // Các tỉnh miền Trung
    'thanh hoá': 'Tỉnh Thanh Hoá',
    'nghệ an': 'Tỉnh Nghệ An',
    'hà tĩnh': 'Tỉnh Hà Tĩnh',
    'quảng bình': 'Tỉnh Quảng Bình',
    'quảng trị': 'Tỉnh Quảng Trị',
    'thừa thiên huế': 'Tỉnh Thừa Thiên Huế',
    'quảng nam': 'Tỉnh Quảng Nam',
    'quảng ngãi': 'Tỉnh Quảng Ngãi',
    'bình định': 'Tỉnh Bình Định',
    'phú yên': 'Tỉnh Phú Yên',
    'khánh hoà': 'Tỉnh Khánh Hoà',
    'ninh thuận': 'Tỉnh Ninh Thuận',
    'bình thuận': 'Tỉnh Bình Thuận',
    'kon tum': 'Tỉnh Kon Tum',
    'gia lai': 'Tỉnh Gia Lai',
    'đắk lắk': 'Tỉnh Đắk Lắk',
    'đắk nông': 'Tỉnh Đắk Nông',
    'lâm đồng': 'Tỉnh Lâm Đồng',

    // Các tỉnh miền Nam
    'bình phước': 'Tỉnh Bình Phước',
    'tây ninh': 'Tỉnh Tây Ninh',
    'bình dương': 'Tỉnh Bình Dương',
    'đồng nai': 'Tỉnh Đồng Nai',
    'bà rịa vũng tàu': 'Tỉnh Bà Rịa - Vũng Tàu',
    'vũng tàu': 'Tỉnh Bà Rịa - Vũng Tàu',
    'long an': 'Tỉnh Long An',
    'tiền giang': 'Tỉnh Tiền Giang',
    'bến tre': 'Tỉnh Bến Tre',
    'trà vinh': 'Tỉnh Trà Vinh',
    'vĩnh long': 'Tỉnh Vĩnh Long',
    'đồng tháp': 'Tỉnh Đồng Tháp',
    'an giang': 'Tỉnh An Giang',
    'kiên giang': 'Tỉnh Kiên Giang',
    'hậu giang': 'Tỉnh Hậu Giang',
    'sóc trăng': 'Tỉnh Sóc Trăng',
    'bạc liêu': 'Tỉnh Bạc Liêu',
    'cà mau': 'Tỉnh Cà Mau',
};

const specialDistricts = {
    // Miền Bắc
    'hà giang': 'Thành phố Hà Giang',
    'cao bằng': 'Thành phố Cao Bằng',
    'bắc kạn': 'Thành phố Bắc Kạn',
    'tuyên quang': 'Thành phố Tuyên Quang',
    'lào cai': 'Thành phố Lào Cai',
    'điện biên phủ': 'Thành phố Điện Biên Phủ',
    'lai châu': 'Thành phố Lai Châu',
    'sơn la': 'Thành phố Sơn La',
    'yên bái': 'Thành phố Yên Bái',
    'hoà bình': 'Thành phố Hòa Bình',
    'thái nguyên': 'Thành phố Thái Nguyên',
    'lạng sơn': 'Thành phố Lạng Sơn',
    'hạ long': 'Thành phố Hạ Long',
    'cẩm phả': 'Thành phố Cẩm Phả',
    'uông bí': 'Thành phố Uông Bí',
    'móng cái': 'Thành phố Móng Cái',
    'bắc giang': 'Thành phố Bắc Giang',
    'việt trì': 'Thành phố Việt Trì',
    'vĩnh yên': 'Thành phố Vĩnh Yên',
    'phúc yên': 'Thành phố Phúc Yên',
    'bắc ninh': 'Thành phố Bắc Ninh',
    'từ sơn': 'Thành phố Từ Sơn',
    'hải dương': 'Thành phố Hải Dương',
    'chí linh': 'Thành phố Chí Linh',
    'hưng yên': 'Thành phố Hưng Yên',
    'thái bình': 'Thành phố Thái Bình',
    'phủ lý': 'Thành phố Phủ Lý',
    'nam định': 'Thành phố Nam Định',
    'ninh bình': 'Thành phố Ninh Bình',
    'tam điệp': 'Thành phố Tam Điệp',

    // Miền Trung
    'thanh hóa': 'Thành phố Thanh Hóa',
    'sầm sơn': 'Thành phố Sầm Sơn',
    vinh: 'Thành phố Vinh',
    'hoàng mai': 'Thành phố Hoàng Mai',
    'cửa lò': 'Thành phố Cửa Lò',
    'hà tĩnh': 'Thành phố Hà Tĩnh',
    'hồng lĩnh': 'Thành phố Hồng Lĩnh',
    'đồng hới': 'Thành phố Đồng Hới',
    'đông hà': 'Thành phố Đông Hà',
    'quảng trị': 'Thành phố Quảng Trị',
    huế: 'Thành phố Huế',
    'tam kỳ': 'Thành phố Tam Kỳ',
    'hội an': 'Thành phố Hội An',
    'quảng ngãi': 'Thành phố Quảng Ngãi',
    'quy nhơn': 'Thành phố Quy Nhơn',
    'tuy hoà': 'Thành phố Tuy Hòa',
    'nha trang': 'Thành phố Nha Trang',
    'cam ranh': 'Thành phố Cam Ranh',
    'phan rang': 'Thành phố Phan Rang-Tháp Chàm',
    'phan thiết': 'Thành phố Phan Thiết',
    'la gi': 'Thành phố La Gi',

    // Tây Nguyên
    'kon tum': 'Thành phố Kon Tum',
    pleiku: 'Thành phố Pleiku',
    'an khê': 'Thành phố An Khê',
    'ayun pa': 'Thành phố Ayun Pa',
    'buôn ma thuột': 'Thành phố Buôn Ma Thuột',
    'buôn hồ': 'Thành phố Buôn Hồ',
    'gia nghĩa': 'Thành phố Gia Nghĩa',
    'đà lạt': 'Thành phố Đà Lạt',
    'bảo lộc': 'Thành phố Bảo Lộc',

    // Miền Nam
    'đồng xoài': 'Thành phố Đồng Xoài',
    'bình long': 'Thành phố Bình Long',
    'phước long': 'Thành phố Phước Long',
    'tây ninh': 'Thành phố Tây Ninh',
    'thủ dầu một': 'Thành phố Thủ Dầu Một',
    'dĩ an': 'Thành phố Dĩ An',
    'thuận an': 'Thành phố Thuận An',
    'tân uyên': 'Thành phố Tân Uyên',
    'biên hoà': 'Thành phố Biên Hòa',
    'long khánh': 'Thành phố Long Khánh',
    'vũng tàu': 'Thành phố Vũng Tàu',
    'bà rịa': 'Thành phố Bà Rịa',
    'tân an': 'Thành phố Tân An',
    'kiến tường': 'Thành phố Kiến Tường',
    'mỹ tho': 'Thành phố Mỹ Tho',
    'gò công': 'Thành phố Gò Công',
    'bến tre': 'Thành phố Bến Tre',
    'trà vinh': 'Thành phố Trà Vinh',
    'vĩnh long': 'Thành phố Vĩnh Long',
    'bình minh': 'Thành phố Bình Minh',
    'cao lãnh': 'Thành phố Cao Lãnh',
    'sa đéc': 'Thành phố Sa Đéc',
    'hồng ngự': 'Thành phố Hồng Ngự',
    'long xuyên': 'Thành phố Long Xuyên',
    'châu đốc': 'Thành phố Châu Đốc',
    'rạch giá': 'Thành phố Rạch Giá',
    'hà tiên': 'Thành phố Hà Tiên',
    'vị thanh': 'Thành phố Vị Thanh',
    'ngã bảy': 'Thành phố Ngã Bảy',
    'sóc trăng': 'Thành phố Sóc Trăng',
    'bạc liêu': 'Thành phố Bạc Liêu',
    'cà mau': 'Thành phố Cà Mau',

    // Thành phố thuộc thành phố trực thuộc trung ương
    'thủ đức': 'Thành phố Thủ Đức',
};

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
    const [isLoading, setIsLoading] = useState(false);

    const API_KEY = 'AIzaSyCBPja5XKspahQL_sh7nWDOEng2dEEwnVM';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const BACKEND_API = `https://search-accommodation.onrender.com${endpoints.post}`; 

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

        
        if (textLower.includes('phòng trọ') || textLower.includes('nhà trọ')) 
            params.room_type = 'Phòng trọ';
        else if (textLower.includes('nhà nguyên căn')) 
            params.room_type = 'Nhà nguyên căn';
        else if (textLower.includes('căn hộ dịch vụ') || textLower.includes('căn hộ')) 
            params.room_type = 'Căn hộ dịch vụ';
        else if (textLower.includes('chung cư')) 
            params.room_type = 'Chung cư';

       
        const pricePatterns = [
            
            {
                regex: /(?:từ|tu|trên|tren|hơn|hon)\s*(\d+)\s*(?:triệu|tr)?\s*(?:đến|tới|den|toi)\s*(\d+)\s*triệu/,
                handler: (matches) => {
                    params.price.min = parseInt(matches[1]) ;
                    params.price.max = parseInt(matches[2]);
                }
            },
            
            {
                regex: /(?:dưới|duoi|thấp hơn|thap hon|không quá|khong qua)\s*(\d+)\s*triệu/,
                handler: (matches) => {
                    params.price.max = parseInt(matches[1]);
                }
            },
           
            {
                regex: /(?:từ|từ|trên|tren|hơn|hon|lớn hơn|lon hon)\s*(\d+)\s*triệu/,
                handler: (matches) => {
                    params.price.min = parseInt(matches[1]) ;
                }
            },
            
            {
                regex: /(?:khoảng|khoang|giá|gia)\s*(\d+)\s*triệu/,
                handler: (matches) => {
                    const price = parseInt(matches[1]);
                    params.price.min = (price - 1) ;
                    params.price.max = (price + 1);
                }
            }
        ];

        
        const areaPatterns = [
            
            {
                regex: /(?:từ|tu|trên|tren)\s*(\d+)\s*(?:m2|m²|mét vuông)?\s*(?:đến|tới|den|toi)\s*(\d+)\s*(?:m2|m²|mét vuông)?/,
                handler: (matches) => {
                    params.area.min = parseInt(matches[1]);
                    params.area.max = parseInt(matches[2]);
                }
            },
            
            {
                regex: /(?:dưới|duoi|thấp hơn|thap hon|không quá|khong qua)\s*(\d+)\s*(?:m2|m²|mét vuông)/,
                handler: (matches) => {
                    params.area.max = parseInt(matches[1]);
                }
            },
            
            {
                regex: /(?:trên|tren|hơn|hon|lớn hơn|lon hon)\s*(\d+)\s*(?:m2|m²|mét vuông)/,
                handler: (matches) => {
                    params.area.min = parseInt(matches[1]);
                }
            },
            
            {
                regex: /khoảng\s*(\d+)\s*(?:m2|m²|mét vuông)/,
                handler: (matches) => {
                    const area = parseInt(matches[1]);
                    params.area.min = area - 5;
                    params.area.max = area + 5;
                }
            }
        ];

        
        const locationPatterns = [
            // Pattern cho thành phố/tỉnh
            {
                regex: /(?:tại|ở|trong|o)?\s*((?:thành phố|tp|tỉnh)\s+[^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    const cityName = matches[1].trim().toLowerCase();
                    // Chuẩn hóa tên thành phố/tỉnh
                    if (cityName.match(/(?:tp|thành phố|thanh pho)\s*hồ?\s*chí?\s*minh/i)) {
                        params.location.city = 'Thành phố Hồ Chí Minh';
                        return;
                    }
                    Object.entries(specialLocations).forEach(([key, value]) => {
                        if (cityName.includes(key)) {
                            params.location.city = value;
                        }
                    });
                }
            },

            // Pattern cho quận/huyện/thành phố thuộc tỉnh
            {
                regex: /(?:quận|quan|huyện|huyen|thành phố|tp)\s+([^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    const districtName = matches[1].trim().toLowerCase();

                    // Kiểm tra các thành phố thuộc tỉnh trước
                    let found = false;
                    Object.entries(specialDistricts).forEach(([key, value]) => {
                        if (districtName.includes(key)) {
                            params.location.district = value;
                            found = true;
                        }
                    });

                    // Nếu không phải thành phố thuộc tỉnh, xử lý như quận/huyện bình thường
                    if (!found) {
                        let prefix = '';
                        if (matches[0].toLowerCase().includes('thành phố') || matches[0].toLowerCase().includes('tp')) {
                            prefix = 'Thành phố';
                        } else if (matches[0].toLowerCase().includes('quận') || matches[0].toLowerCase().includes('quan')) {
                            prefix = 'Quận';
                        } else if (matches[0].toLowerCase().includes('huyện') || matches[0].toLowerCase().includes('huyen')) {
                            prefix = 'Huyện';
                        }
                        const cleanedName = cleanLocationName(districtName);
                        params.location.district = `${prefix} ${capitalizeFirstLetter(cleanedName)}`;
                    }
                }
            },

            // Pattern cho phường/xã/thị trấn
            {
                regex: /(?:phường|phuong|xã|xa|thị trấn|thi tran)\s+([^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    if (!text.toLowerCase().includes('thị xã') && !text.toLowerCase().includes('thi xa')) {
                        let wardName = matches[1].trim();
                        wardName = cleanLocationName(wardName);
                        let prefix = '';
                        if (matches[0].toLowerCase().includes('phường') || matches[0].toLowerCase().includes('phuong')) {
                            prefix = 'Phường';
                        } else if (matches[0].toLowerCase().includes('thị trấn') || matches[0].toLowerCase().includes('thi tran')) {
                            prefix = 'Thị trấn';
                        } else if (matches[0].toLowerCase().includes('xã') || matches[0].toLowerCase().includes('xa')) {
                            prefix = 'Xã';
                        }
                        params.location.ward = `${prefix} ${capitalizeFirstLetter(wardName)}`;
                    }
                }
            }
        ];

        // Special cases for district numbers
        {
            const districtNumberMatch = text.toLowerCase().match(/(?:quận|quan)\s+(\d+)(?:,|\s|$)/i);
            if (districtNumberMatch) {
                params.location.district = `Quận ${districtNumberMatch[1]}`;
            }
        }

      
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

       
        [...pricePatterns, ...areaPatterns, ...locationPatterns].forEach(pattern => {
            const matches = textLower.match(pattern.regex);
            if (matches) {
                pattern.handler(matches);
            }
        });

        
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
        if (!question.trim() || isLoading) return;

        setIsLoading(true);
        const newMessages = [...messages, {
            type: 'question',
            text: question,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }];
        setMessages(newMessages);

        const params = extractSearchParams(question);

        try {
            if (params) {
                const res = await API.get(BACKEND_API, { 
                    params,
                    timeout: TIMEOUT_DURATION,
                    timeoutErrorMessage: 'Request timed out'
                });
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
            } else {
                const response = await API.post(API_URL, {
                    contents: [{ parts: [{ text: question }] }]
                }, {
                    timeout: TIMEOUT_DURATION,
                    timeoutErrorMessage: 'Request timed out'
                });
                const answer = response.data.candidates[0].content.parts[0].text;
                setMessages([...newMessages, {
                    type: 'answer',
                    text: answer,
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } catch (error) {
            console.error('ChatBot Error:', error);
            
            const errorMessage = error.code === 'ECONNABORTED' 
                ? 'Kết nối quá thời gian, vui lòng thử lại.'
                : 'Xin lỗi, đã có lỗi xảy ra!';

            setMessages([...newMessages, {
                type: 'answer',
                text: errorMessage,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
            setQuestion('');
        }
    };

    const searchSuggestions = [
        {
            text: "Tìm phòng quận 1 dưới 5 triệu",
            params: { district: "Quận 1", maxPrice: 5 }
        },
        {
            text: "tìm trọ thủ đức giá từ 2 triệu đến 6 triệu",
            params: { district: "Thành phố Thủ Đức", minPrice: 2, maxPrice: 6 }
            
        },
    ];

    const MessageBubble = ({ msg }) => (
        <div className={`flex w-full ${msg.type === 'question' ? 'justify-end' : 'justify-start'} mb-3 md:mb-4`}>
            <div className="flex flex-col" style={{ maxWidth: '80%' }}>
                {msg.type === 'answer' && (
                    <div className="text-base md:text-lg text-gray-500 mb-1 ml-2 font-bold">AI</div>
                )}
                <div
                    className={`relative p-2 md:p-3 rounded-[20px] shadow-sm
                        ${msg.type === 'question' 
                            ? 'bg-red-500 text-white border-2 border-red-200' 
                            : 'bg-gray-100 text-gray-800 border-2 border-gray-200'
                        }`}
                >
                    {msg.type === 'room_results' ? (
                        <div className="space-y-2">
                            <p className="mb-2 text-sm md:text-base">Tôi tìm thấy {msg.posts.length} phòng phù hợp:</p>
                            {msg.posts.map((post) => (
                                <RoomSearchResult key={post.id} post={post} />
                            ))}
                            {msg.totalCount > msg.posts.length && (
                                <p className="text-xs md:text-sm text-gray-500 mt-2">
                                    ...và {msg.totalCount - msg.posts.length} phòng khác
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="break-words whitespace-pre-wrap text-sm md:text-base">
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
        <div className={`
            fixed z-[9999]
            ${isOpen 
                ? 'inset-0 md:inset-auto md:bottom-36 md:right-8' 
                : 'bottom-20 right-4 md:bottom-36 md:right-8'
            }
        `}>
            {!isOpen ? (
                <button
                    className="bg-red-500 p-3 md:p-4 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <FaCommentDots size={20} className="md:w-6 md:h-6" />
                </button>
            ) : (
                <div className={`
                    bg-white shadow-lg rounded-lg flex flex-col overflow-hidden border border-gray-300
                    ${isOpen 
                        ? 'fixed inset-0 md:relative md:w-[380px] md:h-[450px]' 
                        : 'w-[380px] h-[450px]'
                    }
                `}>
                    {/* Header */}
                    <div className="flex items-center justify-between bg-red-600 text-white p-3 h-[50px] flex-shrink-0 rounded-t-lg">
                        <h1 className="text-lg md:text-xl font-semibold">Chat Support</h1>
                        <button
                            className="hover:text-gray-200 transition p-1"
                            onClick={() => setIsOpen(false)}
                        >
                            <FaTimes size={18} className="md:w-5 md:h-5" />
                        </button>
                    </div>
                
                    {/* Messages container */}
                    <div className="flex-1 overflow-hidden"> 
                        <div className="h-full overflow-y-auto px-3 md:px-4 py-2">
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
                                    className="text-xs md:text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-2 md:px-3 py-1"
                                    onClick={() => setQuestion(suggestion.text)}
                                >
                                    {suggestion.text}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Input container */}
                    <div className="border-t border-gray-200 p-2 md:p-3 bg-gray-100 rounded-b-lg">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-1 p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                placeholder="Nhập câu hỏi của bạn..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <button
                                className={`bg-red-500 text-white p-2 rounded-full transition-colors flex-shrink-0
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FaPaperPlane className="w-4 h-4 md:w-5 md:h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
