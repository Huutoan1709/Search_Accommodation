import React, { useState, useEffect } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { notifyError, notifyWarning } from './ToastManager';
const VoiceSearch = ({ onVoiceResult }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [genAI, setGenAI] = useState(null);
    const [lastRequestTime, setLastRequestTime] = useState(0);
    const [showGuide, setShowGuide] = useState(false);
    const COOLDOWN_TIME = 5000; // 10 giây giữa các request
    const EXCLUSION_WORDS = [
        'dưới',
        'trên',
        'hơn',
        'lớn hơn',
        'nhỏ hơn',
        'cao hơn',
        'thấp hơn',
        'khoảng',
        'từ',
        'đến',
        'tối đa',
        'tối thiểu',
        'không quá',
    ];
    const cleanLocationName = (name) => {
        // Loại bỏ các từ chỉ phạm vi và so sánh
        const regex = new RegExp(`\\b(${EXCLUSION_WORDS.join('|')})\\b`, 'gi');
        return name.replace(regex, '').trim();
    };
    useEffect(() => {
        if (process.env.REACT_APP_GEMINI_API_KEY) {
            try {
                const ai = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
                setGenAI(ai);
            } catch (error) {
                console.error('Error initializing Gemini AI:', error);
                notifyError('Lỗi khởi tạo AI');
            }
        }
    }, []);

    const processWithAI = async (transcript) => {
        const now = Date.now();
        if (now - lastRequestTime < COOLDOWN_TIME) {
            const waitTime = Math.ceil((COOLDOWN_TIME - (now - lastRequestTime)) / 1000);
            notifyWarning(`Vui lòng đợi ${waitTime} giây trước khi thử lại`);
            return null;
        }

        if (!genAI) {
            notifyError('AI chưa được khởi tạo');
            return null;
        }

        try {
            setIsProcessing(true);
            setLastRequestTime(now);

            // Xử lý text mà không cần AI nếu là các trường hợp đơn giản
            const simpleResult = processSimpleCommands(transcript);
            if (simpleResult) {
                return simpleResult;
            }

            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `Phân tích yêu cầu tìm kiếm nhà trọ sau và trả về kết quả dưới dạng JSON với format:
            {
                "room_type": "Nhà nguyên căn/Phòng trọ/Căn hộ dịch vụ/Chung Cư" hoặc null,
                "location": {
                    "city": string hoặc null,
                    "district": string hoặc null,
                    "ward": string hoặc null
                },
                "price": {
                    "min": number hoặc null,
                    "max": number hoặc null
                },
                "area": {
                    "min": number hoặc null,
                    "max": number hoặc null
                }
            }

            Yêu cầu tìm kiếm: "${transcript}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const jsonResult = JSON.parse(jsonMatch[0]);
                    return jsonResult;
                }
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                notifyError('Lỗi xử lý kết quả AI');
            }
            return null;
        } catch (error) {
            console.error('Error processing with AI:', error);
            if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
                notifyError('Đã vượt quá giới hạn yêu cầu, vui lòng thử lại sau');
            } else {
                notifyError('Có lỗi xảy ra khi xử lý giọng nói');
            }
            return null;
        } finally {
            setIsProcessing(false);
        }
    };

    const processSimpleCommands = (text) => {
        text = text.toLowerCase().trim();
        const result = {
            room_type: null,
            location: { city: null, district: null, ward: null },
            price: { min: null, max: null },
            area: { min: null, max: null },
        };

        // 1. Xử lý loại phòng
        if (text.includes('phòng trọ') || text.includes('nhà trọ')) result.room_type = 'Phòng trọ';
        else if (text.includes('nhà nguyên căn') || text.includes('nhà trọ nguyên căn'))
            result.room_type = 'Nhà nguyên căn';
        else if (text.includes('căn hộ dịch vụ') || text.includes('căn hộ')) result.room_type = 'Căn hộ dịch vụ';
        else if (text.includes('chung cư')) result.room_type = 'Chung cư';

        // 2. Xử lý địa điểm
        const locationPatterns = [
            // Thành phố/Tỉnh
            {
                regex: /(?:tại|tai|ở|o|trong)?\s*((?:thành phố|thanh pho|tp|tỉnh|tinh)\s+[^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    const cityName = matches[1].trim();
                    // Chuẩn hóa tên thành phố
                    if (cityName.match(/(?:tp|thành phố|thanh pho)\s*hồ?\s*chí?\s*minh/i)) {
                        result.location.city = 'Thành phố Hồ Chí Minh';
                    }
                },
            },
            // Quận/Huyện/Thị xã - đặt pattern này trước pattern xã
            {
                regex: /(?:quận|quan|huyện|huyen|thị xã|thi xa)\s+([^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    let districtName = matches[1].trim();
                    districtName = cleanLocationName(districtName);
                    const normalizedName = capitalizeFirstLetter(districtName);

                    // Xác định tiền tố theo thứ tự ưu tiên
                    let prefix = '';
                    if (matches[0].toLowerCase().includes('thị xã') || matches[0].toLowerCase().includes('thi xa')) {
                        prefix = 'Thị xã';
                    } else if (matches[0].toLowerCase().includes('quận') || matches[0].toLowerCase().includes('quan')) {
                        prefix = 'Quận';
                    } else if (
                        matches[0].toLowerCase().includes('huyện') ||
                        matches[0].toLowerCase().includes('huyen')
                    ) {
                        prefix = 'Huyện';
                    }

                    result.location.district = `${prefix} ${normalizedName}`;
                },
            },

            // Phường/Xã/Thị trấn - đặt pattern này sau pattern thị xã
            {
                regex: /(?:phường|phuong|xã|xa|thị trấn|thi tran)\s+([^,\d]+)(?:,|\s|$)/i,
                handler: (matches) => {
                    // Kiểm tra nếu text đã chứa "thị xã" thì bỏ qua việc xử lý xã
                    if (text.toLowerCase().includes('thị xã') || text.toLowerCase().includes('thi xa')) {
                        return;
                    }

                    let wardName = matches[1].trim();
                    wardName = cleanLocationName(wardName);
                    const normalizedName = capitalizeFirstLetter(wardName);

                    let prefix = '';
                    if (matches[0].toLowerCase().includes('phường') || matches[0].toLowerCase().includes('phuong')) {
                        prefix = 'Phường';
                    } else if (
                        matches[0].toLowerCase().includes('thị trấn') ||
                        matches[0].toLowerCase().includes('thi tran')
                    ) {
                        prefix = 'Thị trấn';
                    } else if (matches[0].toLowerCase().includes('xã') || matches[0].toLowerCase().includes('xa')) {
                        prefix = 'Xã';
                    }

                    result.location.ward = `${prefix} ${normalizedName}`;
                },
            },
        ];
        // 3. Xử lý giá cả - nhiều pattern khác nhau
        const pricePatterns = [
            {
                regex: /(?:từ|tu|trên|tren|hơn|hon|lon hon|lon hon)\s+(\d+)\s*(?:triệu)?\s*(?:đến|tới|toi|den)\s+(\d+)\s*triệu/,
                handler: (matches) => {
                    result.price.min = parseInt(matches[1]);
                    result.price.max = parseInt(matches[2]);
                },
            },
            // Dưới/Thấp hơn/Không quá X triệu
            {
                regex: /(?:dưới|duoi|thấp hơn|thap hon|không quá|khong qua)\s+(\d+)\s*triệu/,
                handler: (matches) => {
                    result.price.max = parseInt(matches[1]);
                },
            },
            // Trên/Hơn/Lớn hơn X triệu
            {
                regex: /(?:từ|từ|trên|tren|hơn|hon|lớn hơn|lon hon)\s+(\d+)\s*triệu/,
                handler: (matches) => {
                    result.price.min = parseInt(matches[1]);
                },
            },
            // Khoảng X triệu
            {
                regex: /(?:khoảng|khoang|giá|gia)\s+(\d+)\s*triệu/,
                handler: (matches) => {
                    const price = parseInt(matches[1]);
                    result.price.min = price - 1;
                    result.price.max = price + 1;
                },
            },
        ];

        // 4. Xử lý diện tích - nhiều pattern khác nhau
        const areaPatterns = [
            // Từ X đến Y mét vuông
            {
                regex: /(?:từ|tu|trên|tren|hơn|hon|lớn hơn|lon hon)\s+(\d+)\s*(?:m2|m²|mét vuông|met vuong|mét|met)?\s*(?:đến|tới|toi|den)\s+(\d+)\s*(?:m2|m²|mét vuông|met vuong|mét|met)?/,
                handler: (matches) => {
                    result.area.min = parseInt(matches[1]);
                    result.area.max = parseInt(matches[2]);
                },
            },
            // Dưới/Thấp hơn X mét vuông
            {
                regex: /(?:dưới|duoi|thấp hơn|thap hon|không quá|khong qua)\s+(\d+)\s*(?:m2|m²|mét vuông|met vuong|mét|met)/,
                handler: (matches) => {
                    result.area.max = parseInt(matches[1]);
                },
            },
            // Trên/Hơn/Lớn hơn X mét vuông
            {
                regex: /(?:trên|tren|hơn|hon|lớn hơn|lon hon)\s+(\d+)\s*(?:m2|m²|mét vuông|met vuong|mét|met)/,
                handler: (matches) => {
                    result.area.min = parseInt(matches[1]);
                },
            },
            // Khoảng X mét vuông
            {
                regex: /khoảng\s+(\d+)\s*(?:m2|m²|mét vuông|met vuong|mét|met)/,
                handler: (matches) => {
                    const area = parseInt(matches[1]);
                    result.area.min = area - 5;
                    result.area.max = area + 5;
                },
            },
        ];

        // Áp dụng tất cả các pattern
        [...locationPatterns, ...pricePatterns, ...areaPatterns].forEach((pattern) => {
            const matches = text.match(pattern.regex);
            if (matches) {
                pattern.handler(matches);
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

        Object.entries(specialLocations).forEach(([keyword, fullName]) => {
            if (text.includes(keyword)) {
                result.location.city = fullName;
            }
        });

        Object.entries(specialDistricts).forEach(([keyword, fullName]) => {
            if (text.toLowerCase().includes(keyword)) {
                result.location.district = fullName;
            }
        });

        return result;
    };

    // Hàm hỗ trợ
    const capitalizeFirstLetter = (string) => {
        return string
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const startListening = () => {
        if (!genAI) {
            notifyError('AI chưa được khởi tạo');
            return;
        }

        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'vi-VN';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Recognized text:', transcript);

                const aiResult = await processWithAI(transcript);
                if (aiResult) {
                    onVoiceResult(aiResult);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                notifyError('Lỗi nhận dạng giọng nói');
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            notifyError('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói');
        }
    };

    const searchGuideExamples = [
        {
            category: 'Loại phòng',
            examples: ['phòng trọ', 'nhà nguyên căn', 'căn hộ dịch vụ', 'chung cư']
        },
        {
            category: 'Địa điểm',
            examples: ['quận 1', 'thành phố Hồ Chí Minh', 'phường Bến Nghé']
        },
        {
            category: 'Khoảng giá',
            examples: ['dưới 5 triệu', 'từ 3 đến 7 triệu', 'khoảng 4 triệu']
        },
        {
            category: 'Diện tích',
            examples: ['trên 30m2', 'từ 20 đến 50m2', 'khoảng 25m2']
        }
    ];

    return (
        <div className="relative inline-block">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <span
                        type="button"
                        onClick={() => {
                            const audio = document.getElementById('startSound');
                            audio.play();
                            startListening();
                        }}
                        onMouseEnter={() => setShowGuide(true)}
                        onMouseLeave={() => setShowGuide(false)}
                        disabled={isProcessing || !genAI}
                        className={`cursor-pointer text-center ${
                            isListening ? 'bg-red-500' : 
                            isProcessing ? 'bg-gray-500' : 
                            !genAI ? 'bg-gray-400' : 'bg-gray-800'
                        } py-4 px-2 rounded-md text-[13px] gap-2 text-white font-medium flex items-center justify-center`}
                        title={!genAI ? 'AI chưa sẵn sàng' : 'Tìm kiếm bằng giọng nói'}
                    >
                        <FaMicrophone className={`${isListening ? 'animate-pulse' : ''}`} size={15} />
                        {isListening ? 'Đang nghe...' : 'Tìm kiếm'}
                    </span>

                    {/* Guide Popup */}
                    {showGuide && (
                        <div className="absolute z-50 right-0 mt-2 w-[400px] bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg p-6 border border-gray-200">
                            <div className="space-y-6">
                                {/* Hướng dẫn chung */}
                                <div>
                                    <h3 className="text-2xl font-semibold  mb-3">
                                        Hướng dẫn tìm kiếm bằng giọng nói
                                    </h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span className="text-gray-700">Nói rõ và từ từ các thông tin bạn muốn tìm kiếm.</span>
                                        </li>
                                        
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span className="text-gray-700">Các thông tin kết hợp có thể bao gồm: loại phòng, địa điểm, giá cả và diện tích.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span className="text-gray-700">Khi tìm kiếm khu vực ở cấp 
                                                <span className='font-semibold'> Quận/Huyện/Thị xã/Thành phố thuộc tỉnh </span>
                                                 ví dụ như Thành phố Quy nhơn thì bắt buộc phải nói có tiền tố đi kèm</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span className="text-gray-700">Tương tự đối với tìm kiếm cấp
                                                <span className='font-semibold'> Phường/Xã/Thị Trấn </span> kèm tiền tố
                                                 </span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Danh sách ví dụ */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Các ví dụ câu tìm kiếm:</h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">→</span>
                                            <span className="text-gray-700 italic">
                                                "Tìm phòng trọ ở quận gò vấp, giá từ 3 đến 5 triệu, diện tích trên 25m2"
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">→</span>
                                            <span className="text-gray-700 italic">
                                                "Tìm nhà nguyên căn dưới 10 triệu ở thành phố Hồ Chí Minh"
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">→</span>
                                            <span className="text-gray-700 italic">
                                                "Tìm phòng trọ ở huyện Hoài Ân, giá khoảng 2 triệu"
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Lưu ý */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-xl text-blue-800 font-medium flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Nhấn vào nút microphone và đợi tiếng "bíp" trước khi nói
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <audio
                    id="startSound"
                    src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
                    preload="auto"
                ></audio>
            </div>
        </div>
    );
};

export default VoiceSearch;
